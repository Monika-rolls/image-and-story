---
title: "Tiny Models, Real Games: A 21,699-Parameter Dino Policy, Perfect Tic-Tac-Toe, and Dino on an ESP32"
date: 2026-11-07
excerpt: "How a 21,699-parameter network learned to play the Chrome Dino game with no safety net, how the same recipe produced perfect tic-tac-toe, and what it looked like running on an ESP32."
tags: ["small models", "PyTorch", "imitation learning", "game AI", "ESP32", "edge AI"]
draft: false
---

*By Syed Azeez and Monika Kusumanchi*

A cactus is coming. The dinosaur can keep running, jump, or duck. Pick wrong at the wrong moment and the run is over.

[Tiny Dino](https://github.com/syedazeez337/tiny-dino), built by **Syed Azeez**, turns that familiar game into a small machine-learning experiment. The shipped policy has **21,699 parameters**. Over 1,000,000 simulated frames it recorded zero crashes, and nothing at run time corrects its choices.

Azeez found the model and the recipe. I took the same recipe and tried it on other games: a tic-tac-toe player that is certified perfect, and the Dino policy running on an ESP32 microcontroller. This post walks through all three.

## Watch it play first

**Tiny Dino, playing on its own:**

![Tiny Dino playing on its own](https://raw.githubusercontent.com/Monika-rolls/image-and-story/main/public/blog/videos/tiny-dino-gameplay.mp4)

**Tiny tic-tac-toe, playing against a human:**

![Tiny tic-tac-toe playing against a human](https://raw.githubusercontent.com/Monika-rolls/image-and-story/main/public/blog/videos/tiny-tictactoe-gameplay.mp4)

## The recipe in one picture

Both games use the same pipeline. Only the game, the teacher, and the size of the output change.

| Step | Tiny Dino | Tiny Tic-Tac-Toe |
|---|---|---|
| Engine | 60 FPS Chromium-style Dino physics, seeded courses | Deterministic 3x3 rules |
| Input | 28 structured state features | 28 features (9 cells x empty/mine/opponent, plus board fullness) |
| Teacher | Bounded look-ahead simulation (offline only) | Exact minimax (offline only) |
| Model | MLP 28 → 96 → 96 → 96 → 3 | MLP 28 → 96 → 96 → 96 → 9 |
| Parameters | 21,699 | 22,281 |
| Loss | Set-valued: any acceptable action gets full credit | Same |
| Check | 5,400-state frozen grid + 1,000,000-frame soak | Every reachable position |

The core idea: do the expensive thinking **before** deployment. A slow, careful teacher labels which moves are acceptable. A tiny network learns to copy it. At play time only the tiny network runs.

## Part 1: Tiny Dino

### What the network sees

The policy does not look at screenshots. Each frame it gets a 28-number vector pulled straight from the simulator: game speed, the dinosaur's height and vertical speed, its control state, and the two nearest obstacles (distance, width, height, vertical position, type). Flags mark when an obstacle slot is empty, so "no obstacle" is never confused with "an obstacle whose numbers happen to be zero".

That is a deliberate scope. Recognizing a cactus in an image is one problem; deciding when to jump is another. Tiny Dino solves the second one.

### A small network with one job

Three hidden layers, 96 units each, SiLU activations, three output scores for `run`, `jump`, `duck`. Every frame the runtime normalizes the features, runs the network, and applies the highest-scoring action unchanged.

There is no teacher at run time and no fallback rule. The runtime checks that inputs and outputs are well-formed, but it never swaps in a "safer" action. The model owns every decision.

Why the inputs include speed and motion, not just distance: picture the same cactus at the same distance in two runs, with the game faster in the second. The dinosaur has less time to react. If it is already falling from a jump, the right action may change again.

### An offline teacher writes the labels

The teacher tries each of the three first actions by simulating forward, then follows a fixed continuation policy for a bounded number of frames (90 for certification) or until the obstacle is passed. Any first action that survives is "acceptable".

This is narrower than searching every possible future, so an approved action survives that specific rollout. It is not a promise of surviving forever.

The model is trained with a **set-valued loss**: it is rewarded for putting probability anywhere in the acceptable set, because often more than one action is fine.

```python
def set_valued_loss(logits, allowed):
    log_prob = torch.log_softmax(logits, dim=-1)
    masked = torch.where(allowed, log_prob, torch.full_like(log_prob, -torch.inf))
    return -torch.logsumexp(masked, dim=-1).mean()
```

### Recorded results

These come from the repository's committed evidence files, not a fresh benchmark.

| Check | Recorded result |
|---|---|
| Model | MLP, 21,699 parameters, FP32 |
| Checkpoint file | 90,929 bytes |
| Frozen certification grid | 5,400 / 5,400 safe actions |
| Held-out and soak runs | 20 seeds x 50,000 frames = 1,000,000 frames |
| Crashes | 0 |
| Runtime interventions | 0 |
| CPU latency | 0.0484 ms p50, 0.0545 ms p95, 0.0709 ms p99 |

The certification grid covers 3 speeds, 30 obstacle distances (packed around the timing boundaries), obstacle types and bird heights, control ages, and paired-obstacle gaps.

### The failures are part of the result

Two things did not ship, and they are the most useful part of the story:

- **A retrained model passed certification, then crashed** on seed 202 at frame 2,327. A GPU-trained candidate was rejected the same way. Passing the grid is a finite check; the long soak runs catch what it misses. New weights need their own checks.
- **INT8 quantization** shrank the file to 29,049 bytes but changed 36 of the 5,400 certified actions. Changed is not the same as unsafe, but it failed the exact-parity rule, so FP32 stayed.

The runtime also refuses to load a checkpoint unless its schema, engine version, and feature-layout hash match, and a test ties the checkpoint's SHA-256 to its certification and soak records. Yesterday's passing report can't quietly vouch for today's weights.

## Part 2: The same recipe on tic-tac-toe

Dino has a bounded teacher and a finite test grid, so its claim has to stay careful. I wanted to see what the recipe gives when both of those limits disappear. Tic-tac-toe is small enough to do exactly that:

- **The teacher is exact.** Minimax solves the game, so it knows the full set of optimal moves in every position.
- **The test is complete.** There are only 5,478 reachable positions, 4,520 of which need a decision. We can check all of them.

### What changed from Dino

Very little, which was the point.

- **Features:** each of the 9 cells is encoded as *empty / mine / opponent*, plus one "how full is the board" number: 28 inputs again. Encoding relative to the player means **one network plays both X and O**.
- **Output:** 9 scores, one per cell. Occupied cells are masked out before picking the best one, so the model can never play an illegal move.
- **Labels:** many positions have several optimal moves (the opening has a few). The set-valued loss handles that without any change.
- **Training:** 400 epochs over the 4,520 labelled positions. It takes a few seconds on a laptop CPU.

```python
def extract_features(state, perspective):
    opponent = other(perspective)
    values = []
    for cell in state.board:
        values += [cell == EMPTY, cell == perspective, cell == opponent]
    values.append(sum(c == EMPTY for c in state.board) / 9)
    return tuple(float(v) for v in values)
```

### Result: perfect play, checked everywhere

The certifier runs the frozen model on every reachable position and compares its move to minimax:

```
decisions:     4520
optimal:       4520
non_optimal:   0
illegal:       0
perfect_play:  true
```

Because the teacher is exact and the check covers the whole game, this claim is stronger than the Dino one: the 22,281-parameter policy makes a game-theoretically optimal move in **every** reachable position, so it never loses. The full certification takes under a second.

## Part 3: Running on an ESP32

A model with ~22K parameters and ~90 KB of FP32 weights is small enough to leave the laptop. The whole forward pass is three small matrix multiplications and a few activations, so I ran the Dino policy's inference on an **ESP32** microcontroller, with the game drawn on a tiny OLED screen. The label in the corner shows the action the model picked for that frame (`RUN`, `JUMP`, or `DUCK`), next to the score.

![Tiny Dino running on an ESP32 with an OLED screen](https://raw.githubusercontent.com/Monika-rolls/image-and-story/main/public/blog/videos/tiny-dino-esp32.mp4)

## What we took away

1. **Put the intelligence in the teacher, not the runtime.** A slow, careful labeller plus a tiny student gives a policy that is cheap to run anywhere, even on a microcontroller.
2. **Let the loss accept every right answer.** The set-valued loss is a one-line change that fits games where several moves are equally good.
3. **Size your claim to your evidence.** Dino's claim is bounded by its grid and seeds. Tic-tac-toe's is total because the teacher is exact and the domain is complete. Same code shape, different strength of guarantee.
4. **Keep the evidence attached to the weights.** Retrained and quantized models had to earn their own results, and some didn't.

## Try it yourself

Tiny Dino (Python 3.13 + [uv](https://docs.astral.sh/uv/), Node 20.19+ for the web app):

```bash
git clone https://github.com/syedazeez337/tiny-dino.git
cd tiny-dino
uv sync
cd web && npm ci && npm run build && cd ..
uv run tiny-dino dino-web --checkpoint artifacts/dino/deploy/model.pt --open
```

Re-check the certification grid:

```bash
uv run tiny-dino dino-certify --checkpoint artifacts/dino/deploy/model.pt --output runs/certify
```

The tic-tac-toe port will land in the same repository soon as a pull request. It has `train`, `certify`, `play` (in the terminal), and `web` commands.

## Credits

- **Syed Azeez**: found the model and recipe, and built [Tiny Dino](https://github.com/syedazeez337/tiny-dino): the engine, teacher, training, certification, and evidence chain.
- **Monika Kusumanchi**: ported the recipe to tic-tac-toe and ran the Dino policy on an ESP32.

The Dino engine reimplements physics and collision rules from [laya-vs-jev](https://github.com/virajbhartiya/laya-vs-jev) (Apache-2.0), itself a port of Chromium's offline dinosaur game (BSD-3-Clause). A longer walkthrough of Tiny Dino is on the [AIYatra blog](https://aiyatra.io/blog/tiny-dino-a-21-699-parameter-policy-that-plays-without-a-safety-net).
