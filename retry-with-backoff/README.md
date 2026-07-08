# Retry with Backoff

Retries a failing async call with an exponentially increasing delay between
attempts, so a transient failure gets a growing window to recover instead of
being hammered immediately.

## Usage

```js
const { retryWithBackoff, RetryExhaustedError } = require('./retry-with-backoff');

try {
  const result = await retryWithBackoff(() => callFlakyService(), {
    maxAttempts: 4,
    baseDelayMs: 350, // doubles each attempt: 350, 700, 1400ms...
    onAttempt: ({ attempt, success }) => console.log(attempt, success),
  });
} catch (err) {
  if (err instanceof RetryExhaustedError) {
    // all attempts failed
  }
}
```

## API

- `retryWithBackoff(fn, options)` — calls `fn(attemptNumber)` up to `maxAttempts` times.
  - `maxAttempts` (default `4`)
  - `baseDelayMs` (default `350`) — delay before the 2nd attempt; doubles (`* factor`) each subsequent attempt.
  - `factor` (default `2`) — backoff multiplier.
  - `onAttempt({ attempt, success, error? })` — called after every attempt.
  - Resolves with the first successful result, or rejects with `RetryExhaustedError` (exposing `.attempts` and `.lastError`) once attempts are exhausted.
