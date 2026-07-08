# DragonGuard

Plain JS implementations of five backend resiliency patterns: circuit
breaker, retry with backoff, timeout, bulkhead isolation, and rate
limiting / load shedding. No dependencies, just `require()` and go.

## Layout

Each pattern gets its own folder with an `index.js` and a short README:

- `circuit-breaker/` — stop calling a dependency that's failing, fail fast (or fall back) until it recovers
- `retry-with-backoff/` — retry a flaky call with growing delays between attempts
- `timeout/` — give up on a slow call after a fixed amount of time
- `bulkhead-isolation/` — cap concurrent calls per pool so one overloaded dependency doesn't take down everything else
- `rate-limiting/` — token bucket limiter that sheds requests once it's out of tokens

```js
const { CircuitBreaker } = require('./circuit-breaker');
const { retryWithBackoff } = require('./retry-with-backoff');
const { withTimeout } = require('./timeout');
const { Bulkhead } = require('./bulkhead-isolation');
const { TokenBucket } = require('./rate-limiting');
```

Options and full API for each one are in that pattern's own README.

## About the .dc.html file

`Resiliency Pattern Library.dc.html` is a prototype of a teaching site
that walks through all five patterns with live demos and animated
pseudocode — open it in a browser and click around. It was built in an
internal authoring format (`x-dc`, `DCLogic`), so don't copy it into a
real codebase as-is. Think of it as a Figma file: good for colors,
spacing, and timing, and the inline `<script>` at the bottom is a decent
reference for the actual state machine / timer logic if you ever build
this UI for real. It's separate from the implementations above — you
don't need it to use them.
