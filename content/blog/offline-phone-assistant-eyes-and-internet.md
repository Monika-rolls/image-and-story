---
title: "Giving My Offline Phone Assistant Eyes and the Internet"
date: 2026-11-21
excerpt: "Mojo, my on-device Android voice assistant, can now look through the camera with Cactus Mirage, a 21.6 MB vision model, and search the web when it's online, without any API keys. The photos never leave the phone."
tags: ["on-device AI", "Android", "vision", "Cactus", "voice assistant", "edge AI"]
draft: false
---

*By Monika Kusumanchi*

Mojo is a voice assistant I'm building that runs entirely on my own phone: a Realme RMX2161 on LineageOS, with a Helio G95 and 6 GB of RAM. Before this week, everything Mojo did came from four small models on the phone:

- **Cactus Whistle** turns speech into text.
- **Cactus Needle 3**, plus a set of regex rules, turns that text into phone actions such as the flashlight, battery level and volume.
- **Qwen3-0.6B** through llama.cpp answers questions.
- **Underdog Woof** speaks the replies in a voice called "Juno". A "Hey Mojo" wake word starts it all hands-free.

Mojo could hear and talk, but it was blind, and it only knew what a 0.6B model remembered from training. This post covers the two things I added: **eyes** (Cactus Mirage on the camera) and **the internet** (web search when the phone is online).

## How Mojo is wired now

Every request starts the same way: Whistle turns speech into text, and a router decides where it goes. Two of the four branches are new. Only one of them ever touches the internet.

![How Mojo is wired: Whistle, a router, then phone actions, camera plus Mirage, web search plus Qwen, or Qwen from memory, all ending in the Woof voice](/blog/images/mojo-architecture.svg)

## Watch it first

**The basics, all on the phone:** flashlight, battery, time and a Qwen answer, from recorded voice clips fed through the app (screen recording, no sound):

![Mojo handling voice commands on the phone](/blog/videos/mojo-voice-commands.mp4)

*Videos of "Hey Mojo, what do you see?" on the live camera are coming soon.*

## Part 1: Eyes

### What it does

| You say | What Mojo does |
|---|---|
| "What do you see?" / "What's in front of me?" | Takes one still from the back camera, describes it with Mirage, and speaks Mirage's description directly |
| "Read this" / "What does this say?" | Reads the printed text in reading order (OCR) |
| "What kind of room is this?" / "What colour is this?" | Mirage extracts structured facts and Qwen answers the specific question from them |

The camera path uses Camera2 and waits for auto-exposure before taking the still. Mirage runs on the phone through `cactus_describe`. **The photo never leaves the phone.**

Here's the test label I used, followed by Mojo's log reading it:

![Synthetic milk label used to test "read this"](/blog/images/mojo-test-label.png)

![Mojo's log: Mirage reads the label, then the London weather turn](/blog/images/mojo-vision-weather.png)

Mojo said: *"It says: FRESH MILK. Best before 12 Dec 2026. Price 3.49"*, 1.4 seconds after I stopped speaking.

On a photo of a bedroom, "what do you see" gave: *"It looks like a bedroom. I can see a bed with floral bedspread, a wardrobe, a lamp, a nightstand and a television."* (I'm not posting that photo. It's my room.)

### Seeing what Mirage sees

Voice answers hide what the model actually found, so I added a **"Mirage: see with boxes"** button to the app. It opens a live camera view. Tap **Scan**, or turn on **Live** to keep scanning, and Mirage marks everything it found: objects in purple with a confidence score, and text in green. The frames go through the same engine thread as voice commands, so the two never run Mirage at the same time.

Here it is on the test label. A repeat scan takes about 0.8 s:

![Mirage drawing labelled boxes on the test label](/blog/videos/mojo-mirage-boxes-label.mp4)

Testing also settled the box format: `[x1, y1, x2, y2]` on a 0–1000 scale of the image. The blue square, at 600–820 px across a 900 px image, came back as 661–918.

### Finding out what Mirage actually is

There was no local file called "mirage", and it would have been easy to guess. Instead I went back to an earlier session where I'd worked out what Mirage was. After that I tested every assumption on the phone rather than trusting the docs. That paid off several times:

![One Cactus engine holds all three models: cactus_models() goes from 2 to 3 to 7 as Whistle, Needle 3 and Mirage load](/blog/images/mojo-engine-bitmask.svg)

- **One engine, three models.** Whistle, Needle and Mirage all load into the same Cactus engine at once. `cactus_models()` went from 2 to 3 to 7. It's a bitmask (speech, text, vision), so 7 means all three. I also checked that Whistle and Needle still worked after Mirage had run.
- **The option names aren't documented.** Testing showed that the valid sections are `scene`, `objects`, `text`, `relations`, `events` and `reasoning`. Sections like `caption` and `relationships` are rejected. Mojo asks for `scene, objects, text, reasoning`.
- **The engine sometimes prints NaN scores**, like `-nan(ind)`, which is not valid JSON. `Vision.kt` replaces them before parsing:

```kotlin
// The engine can print NaN scores ("nan", "-nan(ind)"), which is not valid JSON.
val json = JSONObject(raw.replace(NAN, "0"))
```

### Let the vision model do the talking

My first version passed Mirage's facts to Qwen and had it write the description. It was clumsy ("…visible from the phone's back camera") and slow, at **4.6 s**. A plain "what do you see" now speaks Mirage's own description directly. That takes **1.4 s**, and Qwen can't add anything that isn't in the picture. Qwen only steps in when you ask something specific that needs reasoning over the facts.

![Mirage's JSON (scene, objects with one NaN score, reasoning) turned straight into Mojo's spoken sentence in 1.4 seconds](/blog/images/mojo-mirage-to-speech.svg)

## Part 2: The internet

### No API keys

When Android reports a validated internet connection, Mojo can search:

1. **DuckDuckGo HTML** results, with **Wikipedia** as a fallback
2. **Qwen** answers from the **top 3 snippets**
3. Weather comes from **wttr.in**

A setting picks when this happens: **Off**, **When needed** (the default) or **All questions**. "When needed" means you said "search for…" or "look up…", or asked about news, scores, prices, weather or recent events. When the phone is offline, Mojo says *"I'm offline, so this is from memory"* and Qwen answers on its own.

![Mojo's log: a web search with three sources and a 5,463 ms response](/blog/images/mojo-web-search.png)

*"Search for who won the 2026 world cup"* gave *"Spain won the 2026 FIFA World Cup."* The sources were en.wikipedia.org (twice) and worldcupwiki.com. *"What's the weather in London"* gave *"In London, it's clear, 3 degrees, feels like 0 degrees, wind 4 kilometres an hour."*

"Read this", the weather and a web search, one after another:

![Mojo reading a label, giving the weather and searching the web](/blog/videos/mojo-read-weather-web.mp4)

The same question online, then with Wi-Fi off. Online, the answer comes from the web in 5.7 s. Offline, Qwen answers from memory, and the answer is *"The winner of the 2026 World Cup is ... [insert name]."* That shows why the web matters:

![Mojo answering the same question online and offline](/blog/videos/mojo-online-vs-offline.mp4)

### The "I guess today" bug

During live testing, Mojo overheard a stray phrase, "I guess today", and ran a web search. "Today" counted as needing fresh facts. Now only an actual **question** about a fresh-facts topic goes to the web. A sentence that just happens to contain "today" doesn't.

### Shorter prompts, faster answers

Web answers took about 7.5 s. Giving Qwen **3 short snippets instead of 4 long ones** brought that down to about **5 s**. On a phone with only two fast cores, most of the wait is Qwen reading the prompt, so a shorter prompt helps more than anything else.

## Numbers from the phone

All times run from the end of my speech to the start of Mojo's voice.

![Bar chart: phone commands 22–57 ms, what do you see 1.4 s, read this 1.4–1.6 s, weather 2.3–2.6 s, web question about 5–5.5 s](/blog/images/mojo-latency.svg)

| Task | Time |
|---|---|
| Mirage describe (768 px) | 0.75–0.94 s |
| Camera capture (including auto-exposure) | ~1.8 s |
| "What do you see" | 1.4 s |
| "Read this" | 1.4–1.6 s |
| Weather | 2.3–2.6 s |
| Web question | ~5–5.5 s |
| Existing commands (flashlight, battery) | 22–57 ms, unchanged |

Mirage added 21.6 MB (about 51M parameters) to the app.

## What still isn't good

- **Qwen 0.6B's web answers can be vague.** A question about SpaceX news got a generic answer. Offline, it can be confidently wrong about recent events: it told me the 2026 World Cup was held in Qatar.
- **"Hey Mojo" sometimes wakes on nearby conversation.** That's how "I guess today" got in.
- **Weather location comes from the phone's IP address**, not GPS, so it can be off.

## What I took away

1. **Check what a component is before you build on it.** Looking for a file called "mirage" was the streetlight effect: searching where it's easy to look, not where the answer is.
2. **Test the docs.** The option names, the model bitmask and the NaN scores were all things I found by running the code, not by reading the docs.
3. **Don't send output through a model that doesn't need it.** Speaking Mirage's description directly was faster and more accurate than having Qwen rewrite it.
4. **On a small phone, prompt length is latency.** Cutting the snippets saved more time than any other change.

## Where it lives in the code

- `Vision.kt`: camera capture, Mirage options and parsing (including the NaN cleanup)
- `LookActivity.kt`: the live camera box view (scans go through `Assistant.describeFrame` on the engine thread)
- `WebSearch.kt`: DuckDuckGo, Wikipedia and wttr.in, with no keys
- `Brain.kt` / `Assistant.kt`: routing between commands, vision, web and Qwen
- `cpp/mojo_jni.cpp`: the JNI bridge (`Java_com_mojo_assistant_Cactus_describe`)

## Credits

On-device models: Cactus Whistle, Needle 3 and Mirage; Qwen3-0.6B (Apache 2.0) through llama.cpp. Voice by Underdog Woof (Underdog Non-Commercial License). Web results from DuckDuckGo and Wikipedia, and weather from wttr.in.
