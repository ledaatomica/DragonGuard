# Timeout

Bounds how long the caller will wait for a dependency, so a hung or slow call
can't stall the caller indefinitely.

## Usage

```js
const { withTimeout, TimeoutError } = require('./timeout');

try {
  const result = await withTimeout(() => callSlowService(), 1200);
} catch (err) {
  if (err instanceof TimeoutError) {
    // took longer than 1200ms
  }
}
```

## API

- `withTimeout(fn, timeoutMs)` — calls `fn()` and races it against a `timeoutMs` timer. Resolves/rejects with whatever `fn()` settles with if it finishes first; otherwise rejects with `TimeoutError`. The underlying call is not cancelled — only the caller stops waiting on it.
