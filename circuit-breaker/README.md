# Circuit Breaker

Wraps an unreliable async call so repeated failures stop hitting the dependency
and instead fail fast (or fall back), giving it time to recover.

## Usage

```js
const { CircuitBreaker } = require('./circuit-breaker');

const breaker = new CircuitBreaker({
  failureThreshold: 3,   // consecutive failures before tripping open
  resetTimeoutMs: 3000,  // cooldown before probing again (half-open)
  onStateChange: (state) => console.log('breaker ->', state),
});

async function callDependency() {
  return breaker.call(
    () => fetch('https://example.com/api'),
    () => cachedFallbackResponse(), // optional, used while open
  );
}
```

## API

- `new CircuitBreaker(options)`
  - `failureThreshold` (default `3`) — consecutive failures before the circuit opens.
  - `resetTimeoutMs` (default `3000`) — time to wait before allowing a probe call (half-open).
  - `onStateChange(state)` — called whenever the breaker transitions between `closed`, `open`, `half-open`.
- `breaker.call(fn, fallback?)` — invokes `fn()`. If the circuit is open, calls `fallback()` if provided, otherwise throws. A single failed probe while half-open re-opens the circuit; a successful call resets it to closed.
- `breaker.state` — current state (`closed` | `open` | `half-open`).
