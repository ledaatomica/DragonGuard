# Handoff: Resiliency Pattern Library

## Overview
An open-source, single-page teaching site that explains five backend resiliency patterns — Circuit Breaker, Retry with Backoff, Timeout, Bulkhead Isolation, and Rate Limiting / Load Shedding. Each pattern has a short explanation, an interactive client-side demo, a "where this comes from" context note, and an animated pseudocode block that highlights the line(s) currently executing as you interact with the demo. Tone: playful, illustrated engineering — for developers reading docs for fun/learning, not enterprise software.

## About the Design Files
The bundled file (`Resiliency Pattern Library.dc.html`) is a **design reference** — a working HTML/React prototype built in a proprietary internal authoring format (Design Components) that renders live in-browser but is **not meant to be shipped as-is or copied verbatim into a production codebase**. Treat it the same as a Figma file: a precise visual and behavioral spec.

The task is to **recreate this design in the target codebase's existing environment** (React, Vue, plain JS, static site generator, etc.), using that codebase's existing component patterns, build tooling, and conventions. If no environment exists yet, this is a good candidate for a simple static site (plain HTML/CSS/JS, or a lightweight framework like Astro/Next) since there's no backend — everything, including the "resiliency" behavior, is simulated client-side for teaching purposes.

You *can* open the `.dc.html` file directly in a browser to see it run and interact with it — treat that as the reference implementation for exact visual and interaction fidelity. The inline `<script>` at the bottom of the file contains the full JS logic (state machine transitions, timers, animation sequencing) in plain-ish JS class form — useful as an algorithmic reference even though the surrounding scaffolding (`DCLogic`, `x-dc`, template holes) is proprietary and should not be copied.

## Fidelity
**High-fidelity.** Colors, type, spacing, and all interactive/animation behavior in the reference file are final — recreate pixel- and behavior-accurate in the new stack, adapted to that stack's idioms (e.g. React hooks instead of a class component, CSS modules/Tailwind instead of inline styles).

## Page Structure (single scrolling page)
1. Sticky top nav — logo mark + jump links to each pattern section
2. Hero — title, intro paragraph, primary CTA, small license/OSS note
3. Stat chip row (3 chips)
4. Five pattern sections, each identical two-column layout:
   - Left column (wider, ~55%): white card containing the interactive demo
   - Right column (~45%): a tan "where this comes from" note card + a dark pseudocode card with animated line highlighting
5. Footer

## Design Tokens

### Colors
- Background (page): `#FBF6EE` (warm cream)
- Surface / card background: `#FFFFFF`
- Surface alt (notes, chips, nav pills, unfilled bars/slots): `#F1EBDD`
- Border: `#E4DAC5`
- Ink (primary text): `#221C15`
- Ink soft (secondary text): `#7A705F` / `#4A4237` (body copy)
- Accent (brand, links, CTA, tweakable): default `#E0692E`, alternates offered: `#2E6F9E`, `#7A5FC0`, `#2F8F6B`
- Link hover: `#8F3A16`
- Status green (success / closed / accepted): `#2F8F6B`
- Status amber (half-open / warning): `#D69A2D`
- Status red (failure / open / rejected): `#D1503A`
- Dim/disabled state block: `#D8CEB9`
- Code block background: `#221C15`; code text (inactive line): `#8A9184`; code text (active/highlighted line): `#FFF7EF` on `rgba(224,105,46,0.35)` background
- Selection highlight: `#F6DDCB`

### Typography
- Display/UI font: **Space Grotesk** (400/500/600/700), Helvetica/Arial fallback
- Monospace font (labels, code, stats, log timestamps): **IBM Plex Mono** (400/500/600)
- H1 (hero): 56px / line-height 1.05 / weight 700 / letter-spacing -0.02em
- H2 (section titles): 34px / letter-spacing -0.01em
- Body copy: 16–19px / line-height 1.6–1.65 / color `#4A4237`
- Eyebrow labels ("01 / PROTECT THE CALLER"): 13px monospace, `#7A705F`
- Code: 12.5px monospace, line-height 1.6

### Spacing / Shape
- Page max-width: 1080px, centered, 24px side padding
- Section vertical padding: 56px (80px bottom on last section)
- Card border-radius: 16px (demo cards), 14px (note/code cards), 9–10px (buttons), 999px (pills/badges)
- Card border: 1px solid `#E4DAC5` on white cards
- Grid: two-column `1.1fr 0.9fr` for demo/notes, 24px gap

## Interactions & Behavior (per pattern)

All demos are pure client-side simulations (no network calls) — they exist to teach the *decision logic* of each pattern, not to load-test anything real.

### 1. Circuit Breaker
- State machine: `closed → open → half-open → closed` (or back to `open` on failure while half-open)
- Three-node diagram (Closed / Half-Open / Open) with arrows; the current state's node is filled with its status color, others are dimmed (`#D8CEB9`); the Open node pulses (opacity 1↔0.35, ~1.1s loop) while active
- "Send request" button: disabled + label changes to "Calling…" for ~450ms while a simulated call is in flight (this is when code lines 2–3 highlight — the `try:` / `call(dependency)` lines)
- Outcome: 80% success chance normally, 15% if "Simulate outage" toggle is on. 3 consecutive failures (or any failure while half-open) trips the breaker open; it auto-transitions to half-open after 3s
- While open, requests are rejected instantly (no delay) and highlight the `isOpen()` / `return fallback()` lines
- A rolling log of up to 10 small colored squares (green=success, red=failure, gray=rejected) shows recent request history
- "Reset" clears all state back to closed
- Pseudocode (8 lines) highlights: `[0,1]` when rejecting due to open circuit; `[2,3]` while the call is in flight; `[3,4]` on success; `[5,6,7]` on failure — each highlight clears after ~900ms

### 2. Retry with Backoff
- "Call flaky service" button (disabled + relabeled "Calling…" while running) kicks off up to 4 attempts
- Each attempt has an increasing simulated delay (350ms, 700ms, 1400ms, 2800ms — doubling) and an increasing success chance (`0.2 + attempt*0.22`)
- Each attempt appears as a new row (fade+slide-in animation, ~0.25s) with: attempt number, a horizontal bar whose fill width grows with attempt number and color reflects success (green) or failure (red), and a text label
- On success: shows "Recovered" in green below the attempts; on 4th failure: "Gave up after 4 attempts" in red
- Pseudocode (5 lines: `delay=base`, `for attempt...`, `if call(): return success`, `sleep(...)`, `delay *= 2`) highlights `[1,2]` while a call is "in flight", `[3,4]` during the backoff pause between attempts, `[2]` on success, `[1]` on final failure — each clears after ~900ms

### 3. Timeout
- A slider (100–2400ms, step 100) sets a simulated "service latency"; a fixed threshold marker at 1200ms is drawn on the bar with a small label above it
- "Send request" animates a horizontal fill bar in real time (updates every ~20ms) from 0 up to `min(latency, threshold+150)`
- If latency exceeds 1200ms: bar renders red and result shows "Timed out"; otherwise bar is the accent color turning green with "Success"
- Pseudocode (3 lines) highlights line 0 while running; on completion, lines `[1,2]` (the timeout branch) if it timed out, or stays on `[0]` if it succeeded — this highlight persists until the next run (not auto-cleared)

### 4. Bulkhead Isolation
- Two independent 4-slot pools shown side by side: Pool A ("recommendations") and Pool B ("checkout"), each slot a small square that fills with color when occupied
- "Flood Pool A": sends 6 simulated requests sequentially (~220ms apart); first 4 fill Pool A's slots (turn red), the remaining 2 increment a "requests shed" counter — demonstrating the pool's fixed capacity
- "Try a Pool B request": single click, accepted (turns a Pool B slot green, increments "accepted, unaffected" counter) as long as Pool B has free capacity — demonstrating Pool B is unaffected by Pool A being overwhelmed
- "Reset" clears both pools and counters
- Pseudocode (4 lines) highlights `[0,3]` on an accepted request (pool has room) or `[0,1,2]` on a rejected one (pool full) — clears ~700ms after the action completes

### 5. Rate Limiting / Load Shedding
- A token bucket (5 tokens by default) refills 1 token/second up to capacity, shown as a row of colored circles (filled circles = available tokens, using the accent color)
- "Fire request": consumes one token if available (log entry green, "accepted") or is rejected/shed if the bucket is empty (log entry red, "shed — no tokens")
- A rolling log of up to 10 small colored squares shows recent request outcomes
- Pseudocode (5 lines) highlights `[0,1,2]` (the accept branch) or `[0,3,4]` (the shed branch) for ~700ms after each click

## State Management (per demo — translate to whatever state approach the target stack uses)
- `circuitBreaker`: `{ status: 'closed'|'open'|'half-open', consecutiveFailures, isCalling, simulateOutage, recentLog[] }`
- `retry`: `{ isRunning, attempts[], result, resultWasSuccess }`
- `timeout`: `{ latencyMs, isRunning, progressMs, result, didTimeOut }`
- `bulkhead`: `{ poolAOccupied, poolBOccupied, poolARejectedCount, poolBAcceptedCount, isBusy }`
- `rateLimit`: `{ tokens, capacity, recentLog[] }`, plus a global 1s interval that refills tokens up to capacity
- Each demo also tracks a transient `activeCodeLines: number[]` used purely to drive the pseudocode highlight animation; it's set at the start of a simulated step and cleared (or overwritten) after a short delay (700–900ms) via timers — remember to clean up all timers/intervals on unmount

## Assets
No external image assets. All visuals are CSS shapes (rounded squares/circles) and text — no SVGs to recreate. Fonts are loaded from Google Fonts (Space Grotesk, IBM Plex Mono); use the target codebase's normal font-loading approach (self-hosted or Google Fonts CDN, per its existing convention).

## Files
- `Resiliency Pattern Library.dc.html` — full design reference. Open directly in a browser to interact with every demo. The `<script>` block at the end of the file contains the complete state-machine/timer logic for all five patterns in JS — a good algorithmic reference for the retry backoff timing, circuit breaker trip/reset timing, and token bucket refill logic specifically.
