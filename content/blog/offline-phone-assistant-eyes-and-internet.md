---
title: "Mojo Can See, Read, and Search: An Offline Android Assistant"
date: 2026-11-21
excerpt: "Mojo runs on my Android phone, using Cactus Mirage for camera descriptions and OCR, and web search when online. Here are the routing choices, measured response times, and limits, including OCR digit errors and offline hallucinations."
tags: ["on-device AI", "Android", "vision", "Cactus", "voice assistant", "edge AI"]
draft: false
---

*By Monika Kusumanchi · Revised after the app redesign; all screenshots and recordings show the current app.*

## Mojo can now see, read, and search

Mojo is a voice assistant that runs entirely on my own phone. Ask it "what do you see?" and it describes what's in front of the camera. Say "read this", or take a photo in **Scan text**, and it reads the text in reading order. Ask about news, prices or the weather while the phone is online, and it searches the web first. **Photos never leave the phone.** Only your question goes online, and only when you ask something that needs fresh facts.

![Mojo's home screen, the talk button while listening, and an answer card shown over the phone's home screen](/blog/images/mojo-home-listening.jpg)

*The current app: home, listening, and an answer card that follows Mojo over the home screen.*

## A short demo

![Screen recording: Mojo listens, answers a weather question in the app, then answers a web question over the phone's home screen](/blog/videos/mojo-listening-light.mp4)

*Mojo answers a weather question in the app, then a web question over the home screen. Screen recording, no sound.*

Watch the bottom edge. While Mojo listens, three layered waves rise and fall with the live microphone level; while it thinks, they travel; while it speaks, they pulse. The card above them shows what you said and the answer. If you press Home mid-question, the card follows you, and tapping it stops Mojo. The look is Mojo's own: a coral → tangerine → sun gradient, lagoon teal for buttons, and a sound-bar logo, all drawn with plain Android views and no UI libraries.

## How a request gets answered

Mojo runs on a Realme RMX2161 (LineageOS, Helio G95, 6 GB of RAM). Four small models were already on the phone: **Cactus Whistle** turns speech into text, **Cactus Needle 3** plus regex rules turns text into phone actions, **Qwen3-0.6B** (through llama.cpp) answers questions, and **Underdog Woof** speaks the replies. The new parts are the camera branch and the web branch.

![Diagram: speech goes through Whistle to a router, then to phone actions, camera plus Mirage, web search plus Qwen, or Qwen from memory; Woof speaks every reply](/blog/images/mojo-architecture.svg)

*Every request is routed to one of four branches. Only web search uses the internet.*

## Camera: descriptions, OCR, and object boxes

| You say or tap | What Mojo does |
|---|---|
| "What do you see?" | Takes one still from the back camera and speaks Mirage's own description |
| "Read this" / **Scan text** | Reads the printed text in reading order |
| "What kind of room is this?" | Qwen answers the specific question from Mirage's structured facts |
| **Objects** mode | Draws labelled boxes around what Mirage recognises |

The camera path uses Camera2 and waits for auto-exposure before taking the still. **Cactus Mirage**, a 21.6 MB vision model, runs on the phone through `cactus_describe`. Scans from the camera screen go through the same engine thread as voice commands, so the two never run Mirage at the same time. A repeat scan takes about 0.8 s.

### What Mirage returns

Mirage's docs are thin, so I tested each assumption on the phone:

![Diagram: the shared Cactus engine reports models = 2, then 3, then 7 as Whistle, Needle 3 and Mirage load](/blog/images/mojo-engine-bitmask.svg)

*One engine holds all three models; `cactus_models()` is a bitmask.*

- **One engine, three models.** `cactus_models()` went from 2 to 3 to 7 as Whistle, Needle 3 and Mirage loaded (speech, text and vision bits). Whistle and Needle still worked after Mirage ran.
- **The option names aren't documented.** The valid sections are `scene`, `objects`, `text`, `relations`, `events` and `reasoning`; names like `caption` and `relationships` are rejected. Boxes come back as `[x1, y1, x2, y2]` on a 0–1000 scale of the image.
- **Scores can be NaN.** The engine sometimes prints `-nan(ind)`, which isn't valid JSON, so Mojo replaces it with 0 before parsing.

My first version passed Mirage's facts to Qwen to write the description. It was clumsy ("…visible from the phone's back camera") and took **4.6 s**. Now a plain "what do you see" speaks Mirage's description directly: **1.4 s**, and nothing gets added that isn't in the picture. On a photo of my bedroom (not posted), it said: *"It looks like a bedroom. I can see a bed with floral bedspread, a wardrobe, a lamp, a nightstand and a television."*

![Diagram: Mirage's JSON, including one NaN score, turned directly into Mojo's spoken sentence](/blog/images/mojo-mirage-to-speech.svg)

*Mirage's structured result becomes the spoken answer directly; dropping Qwen from this path cut the response from 4.6 s to 1.4 s.*

### Scan text: accuracy and limits

Before writing app code, I tested OCR on the PC with a synthetic 14-line receipt:

- Raw output repeats itself ("GREEN LEAF CAFE" and also "CAFE") and splits lines. Mojo merges overlapping boxes, keeps the longest text, groups boxes into rows and reads them left to right.
- Bigger photos didn't help, since Mirage works at 512 px internally. Splitting the photo into halves gained only 2–4 points and doubled the time, so Mojo reads one 768 px frame.
- On the phone, it found **all 14 lines, in order, in 2.8 s**, with **about 80–84% of words exactly right**. The typical slip is digits: 45.00 can come back as 45.88. Check numbers before relying on them.

In the app, Scan text freezes the photo, highlights the text and lists it with **Copy** and **Share**. Tapping a highlight copies one line.

![Screen recording: Scan text reads a receipt, copies one line, then Objects mode boxes a milk label](/blog/videos/mojo-scan-text.mp4)

*Scan text on the test receipt, copying one line, then Objects mode on a test milk label. Screen recording, no sound.*

## Web search when the phone is online

When Android reports a validated internet connection, Mojo can search with no API keys: **DuckDuckGo** HTML results with **Wikipedia** as a fallback, and **Qwen** answers from the top 3 snippets. Weather comes from **wttr.in**. A setting chooses **Off**, **When needed** (the default) or **All questions**. "When needed" means you said "search for…" or "look up…", or asked about news, scores, prices, weather or recent events. Offline, Mojo says *"I'm offline, so this is from memory"* and Qwen answers alone.

*"Search for who won the 2026 world cup"* returned *"Spain won the 2026 FIFA World Cup"*, citing en.wikipedia.org (twice) and worldcupwiki.com. *"What's the weather in London"* returned *"In London, it's clear, 3 degrees, feels like 0 degrees, wind 4 kilometres an hour."*

### Routing and latency fixes

- **The "I guess today" bug.** During testing, Mojo overheard "I guess today" and ran a web search, because "today" counted as needing fresh facts. Now only an actual question about a fresh-facts topic goes to the web.
- **Shorter prompts, faster answers.** Web answers took about 7.5 s. Giving Qwen 3 short snippets instead of 4 long ones brought that to about 5 s. With only two fast cores, most of the wait is Qwen reading the prompt.

## Results on this phone

All times run from the end of my speech to the start of Mojo's voice.

![Bar chart of response times: phone commands 22–57 ms, "what do you see" 1.4 s, "read this" 1.4–1.6 s, weather 2.3–2.6 s, web question about 5–5.5 s](/blog/images/mojo-latency.svg)

*Measured response times on the Realme RMX2161.*

| Task | Time |
|---|---|
| Mirage describe (768 px) | 0.75–0.94 s |
| Camera capture, including auto-exposure | ~1.8 s |
| "What do you see" | 1.4 s |
| "Read this" | 1.4–1.6 s |
| Scan text, 14-line receipt | 2.8 s |
| Weather | 2.3–2.6 s |
| Web question | ~5–5.5 s |
| Phone commands (flashlight, battery) | 22–57 ms, unchanged |

Mirage added 21.6 MB (about 51M parameters) to the app.

## What still needs work

- **Qwen 0.6B's web answers can be vague.** A question about SpaceX news got a generic answer.
- **Offline, Qwen makes things up about recent events.** Asked the same World Cup question with Wi-Fi off, it answered *"The winner of the 2026 World Cup is ... [insert name]"*, and once claimed the tournament was held in Qatar. Online, the web answer arrived in 5.7 s.
- **OCR digits slip**, as above.
- **"Hey Mojo" sometimes wakes on nearby conversation.** That's how "I guess today" got in.
- **Weather location comes from the phone's IP address**, not GPS, so it can be off.

The lesson I keep relearning: test what a component actually does before building on it. The bitmask, the option names and the NaN scores all came from running the code, not from the docs.

## Code map

- **Camera and OCR:** `Vision.kt` (capture, Mirage options, NaN cleanup), `Ocr.kt` (text boxes to lines), `LookActivity.kt` (Objects and Text modes)
- **Interface:** `Ui.kt` (design system), `MojoVisuals.kt` and `MojoOverlay.kt` (talk button, voice ribbon, listening card over other apps)
- **Routing and search:** `Brain.kt` and `Assistant.kt` (commands, vision, web, Qwen), `WebSearch.kt` (DuckDuckGo, Wikipedia, wttr.in)
- **Native bridge:** `cpp/mojo_jni.cpp` (`Java_com_mojo_assistant_Cactus_describe`)

## Credits

On-device models: Cactus Whistle, Needle 3 and Mirage; Qwen3-0.6B (Apache 2.0) through llama.cpp. Voice by Underdog Woof (Underdog Non-Commercial License). Web results from DuckDuckGo and Wikipedia; weather from wttr.in.
