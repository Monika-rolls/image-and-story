---
title: "Hark: An Audiobook You Can Interrupt"
date: 2026-11-21
excerpt: "Say \"wait, what did that mean?\" and Hark answers from the passage you just heard, then picks up where it left off. The trick is that the question names no topic, so Hark looks up the answer by where you are in the audio, not by your words."
tags: ["voice AI", "RAG", "audiobooks", "Gemini", "Cloud Run", "learning"]
draft: false
---

*By Monika Kusumanchi · [Try Hark](https://hark-130328189871.asia-southeast1.run.app) · [Code on GitHub](https://github.com/Monika-rolls/hark)*

## The one teacher you can't raise your hand at

I learn a lot by ear: on the bus, on walks, with my hands busy. An audiobook is a good teacher until a sentence doesn't land. Then you have two options. You can rewind, which plays the same words that already didn't make sense, or you can stop and search on your phone for something you can't even name yet.

What you actually want to do is ask: *"wait, what did that mean?"* Hark lets you. You talk over the book, it pauses, answers from the part you just heard, and goes back to reading.

![Hark's intro: a listener on a bus gets lost in a calculus audiobook, rewinds, and gives up, until she can just ask](/blog/videos/hark-intro.mp4)

*The 28-second intro from my demo. Sound on.*

## A short demo

![Screen recording: Hark reads Calculus Made Easy, the listener says "wait, what did it mean?", Hark explains constants and variables, then saves the idea to her notes](/blog/videos/hark-ask-and-save.mp4)

*The live app on Cloud Run, using the Google voice engine. I say "wait", ask "what did it mean?", get the answer from the passage I just heard, then say "okay, remember it". Sound on.*

The book was in the middle of this line from Silvanus Thompson's *Calculus Made Easy*: *"…we denote by letters from the end of the alphabet, such as x, y, z, u, v, w."* My question doesn't say any of that. Hark still answered about the right thing:

> The author is introducing the core idea that calculus is about measuring how changing things grow in relation to each other. He separates fixed numbers, called constants, from changing values, called variables, usually represented by letters like x, y and t.

![Hark's player: the calculus chapter, Stop listening, and the conversation with the explanation of constants and variables](/blog/images/hark-answer.jpg)

*Each question is pinned to the moment you asked it. Tap one in "Your questions" to replay from there.*

## Why ordinary search gets this wrong

The usual way to give a model a document is RAG: embed the question, find the passages that look most like it, and hand those to the model. That works when the question names its topic: *"how does a derivative work?"*

*"What did that mean?"* names nothing. There's no topic, no entity and no keyword in it. Words like "that", "this", "he" and "the last bit" (linguists call them *deictic*) point at the context instead of carrying it. They're exactly the words people use when they're lost, and they're the words search handles worst.

So Hark looks up the passage by **position, not by words**. Where you are in the audio is the query. It reads a window from 90 seconds before the playhead to 15 seconds after, which covers the run-up to the sentence as well as the sentence itself. It doesn't matter whether you managed to name what confused you.

![Timeline of a 17-minute chapter: at 10:00, ordinary search returns 02:23, 13:58, 14:52 and 16:03, three of them ahead of the listener; Hark returns 08:23, 09:20 and 10:12](/blog/images/hark-position-vs-search.svg)

*Same question, same chapter, same moment. Three of the four passages ordinary search returned are from parts the listener hasn't reached yet.*

The repo has a script that runs both approaches side by side, `compare_rag.py`. Asked ten minutes into the Calculus chapter, ordinary search returned passages from 16:03, 13:58, 14:52 and 02:23. Hark returned 08:23, 09:20 and 10:12.

That points to the second rule: **nothing after the playhead exists.** When you do name something (*"who's Lord Henry again?"*), Hark searches everything you've already heard and nothing after it. Answering a chapter 3 question with chapter 12 material would spoil the book, and that's a real failure. The only time Hark goes forward is when you ask it to take you somewhere: *"take me to the part about the train and the embankment"* jumps the book there, because that's your choice.

How far back Hark reads is your choice too: 30 seconds, 90 seconds, 3 minutes or 5 minutes. Five minutes is the ceiling because of the AssemblyAI engine: it cuts a tool response off at 8 KiB, and five minutes of narration fits with room to spare.

## The hard part: the agent can't see the page

This is the piece the whole design is built around. The voice model runs on someone else's servers and calls Hark's tools over plain HTTP. It has no idea where playback is, because that lives in a browser tab. And the browser can't be reached from those servers, so the agent can't push a jump to it either.

Both directions go through shared state. The browser reports its position once a second. When the agent calls `passage_at_playhead`, the tool reads that position, cuts the passage around it, and answers. When the agent calls `go_to_topic`, the tool leaves a pending jump behind, and the next once-a-second reply carries it back to the browser.

![Diagram: the browser sends its position to the Hark backend once a second; the voice engine calls a Hark tool over HTTP; the tool reads the position from shared state; a pending jump rides the next reply back to the browser](/blog/images/hark-playhead-seam.svg)

*The playhead travels separately from the conversation. That's what makes a position-first agent work on servers that hold no session.*

Two more consequences:

- **One agent per listener.** AssemblyAI calls a tool anonymously: the request carries the model's arguments and nothing that identifies the conversation. So when you start a voice session, Hark creates a stored agent just for you, with your session id built into its tool URLs, and deletes it when you hang up. Without that, two people listening at once would get each other's answers. I checked this live with several listeners.
- **It's a web app because of echo cancellation.** The book and Hark's voice both come out of the speakers and straight back into the microphone. The browser's built-in echo cancellation removes them. The first version of Hark was a desktop app, and it kept fighting that echo.

## Three voice engines, one protocol

Under **Settings → Voice engine** you pick who listens and talks:

| Engine | Speech to text | Picks the tool | Writes the answer | Speaks |
|---|---|---|---|---|
| **Cloud** | AssemblyAI | AssemblyAI | AssemblyAI | AssemblyAI (all in one websocket) |
| **Google** | Cloud Speech-to-Text (Chirp) | Gemini function calling | Gemini on Vertex AI | Chirp 3 HD voices |
| **Local** | Whistle (16.9 MB) | Needle 3 (35 MB) | Gemini, or Gemma 3 1B on llama.cpp | PocketTTS (~100M) |

All three speak the same wire protocol, so the page's message loop doesn't change between them. The Local engine is the same stack as [Mojo, my offline phone assistant](/blog/offline-phone-assistant-eyes-and-internet), with Whistle for speech and Needle 3 for tool calls. With Gemma it doesn't need the cloud at all. Needle only emits tool calls, never sentences, so something else has to write the spoken reply.

One detail in the Google engine: the voice follows the script of the answer. Ask *"say that in Hindi"* and the reply is spoken by a Hindi voice, not by an English voice reading Devanagari. The same goes for Telugu, Tamil, Japanese and the rest.

The Google and Local engines authenticate as the Cloud Run service account, so there's no API key in the container.

![Hark's settings: the voice engine (Cloud, Local, Google), the voice, and switches for each tool](/blog/images/hark-settings.jpg)

*Every tool except "What did that mean?" can be switched off. Answer length, look-back and playback speed are further down.*

## More than "what did that mean?"

Once Hark knew where you are, the rest of the study tools came easily. All of them read from the same window:

- **Recap:** "catch me up" summarises the last few minutes in order.
- **Explain simply:** plain words and an everyday example.
- **Translate:** "say that in Hindi" explains the passage in another language.
- **Quiz me:** asks one question about what you heard, then marks your answer.
- **Remember this:** saves the idea to your notes. In the demo it saved *"how variables depend on each other, like projectile height over time"*. Notes export as a Markdown file.
- **Jump to a topic, Overview, Web search:** move the book, describe the whole title, or look something up on Google, with the source named.

## Bring your own book

The built-in titles are LibriVox and NASA recordings in the public domain. You can also paste a direct link to any audio file. Hark then builds the same index it uses for its own books:

1. Transcribe with AssemblyAI.
2. Cut chunks at the reader's own pauses, so no chunk stops mid-sentence.
3. Embed each chunk with Gemini (768 dimensions) and store it against its timestamp.

Audiobooks come as one file per chapter, so a book can be a list of links. Hark lays them end to end on one timeline. The files transcribe in parallel, so the wait is the slowest chapter, not the sum of all of them. Russell's *The Problems of Philosophy* is fifteen files and 4 hours 51 minutes. It indexes in about 12 minutes and answers a question four hours in from the right passage of the right file.

## What broke on the way

Most of the work after the first version was making the voice loop survive real rooms and a real server:

- **Noise opened turns.** A fan, a door or the TV was loud enough to count as speech, and the speech-to-text model put words to it. Now a frame only counts as speech when it's loud *and* Silero VAD hears a voice.
- **Then the fix was too strict.** With a 280 ms threshold for the start of speech, "Please quiz me." and "Wait, what did he mean by that last part?" never opened a turn, because speech dips between syllables. At 150 ms they all do, and loud white noise is still rejected.
- **One stuck reply silenced everything.** Speaking held the single model lock for the whole reply, so a reply that hung blocked every later transcription. Text to speech got its own lock, and Gemini calls time out after 30 seconds.
- **The page sat on "Thinking" forever** when an utterance was dropped silently. Every dropped turn now ends with an explicit "done".
- **A 46 MB podcast wouldn't play.** Cloud Run refuses any response over 32 MiB, and the browser's first request for audio asks for the whole file. Hark now serves audio in ranges of at most 4 MiB, and the browser fetches the next one.

## Numbers

| | |
|---|---|
| 47-minute book (45.7 MB) | transcribed and indexed in 45 s |
| Whole book: 15 files, 4.85 hours | 392 chunks, about 12 min, one timeline |
| Finding the window (every question) | about 3 ms locally |
| Search over 8,000 chunks (a 44-hour book) | 85 ms |
| Index size | 1.5 KB per chunk, about 3 MB for a 10-hour book |

**No vector database.** Plain cosine similarity over every chunk of a 44-hour book takes 85 ms, against roughly two seconds for the model call it feeds. A vector database would have added about 200 MB of dependencies to save nothing you could measure.

There are 161 tests, and they run the whole retrieval and ingest path with no keys, no network and no audio hardware. Every push to `main` is tested, built and deployed to Cloud Run by GitHub Actions, which signs in to Google through Workload Identity Federation. No service-account key is stored anywhere. A smoke test then checks `/api/health` on the live service.

## Limits

- **Position is only as good as the transcript.** Chunks come from the transcript's timestamps. If a passage is mis-transcribed, Hark explains the wrong words.
- **Uploads are small; links aren't.** Hosting platforms cap a request body, so a direct upload is for a chapter or an episode. A whole book goes in as links.
- **The local engine needs a real server.** Whistle, Needle and PocketTTS need a process that stays up to hold the models. That's why the live app runs as a Cloud Run container rather than as short-lived functions.
- **The no-spoiler rule is partly a prompt.** Retrieval can't return anything past the playhead, but the model still knows famous books on its own. It's told never to fill that gap and to mark outside knowledge as *"not in the book, but…"*. That's an instruction, not a guarantee.

## Try it

- **Live app:** [hark-130328189871.asia-southeast1.run.app](https://hark-130328189871.asia-southeast1.run.app). Pick a title, tap **Enable asking questions**, and talk whenever something doesn't land.
- **Code:** [github.com/Monika-rolls/hark](https://github.com/Monika-rolls/hark) (MIT).

The part I'd keep from all of this is the first rule. When someone is lost, the useful question isn't *what did they say*, it's *where were they*.
