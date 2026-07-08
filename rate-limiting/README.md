# Rate Limiting / Load Shedding

A token bucket that caps request throughput: each call consumes a token, and
tokens refill at a steady rate. When the bucket is empty, requests are shed
immediately instead of being queued or overloading the dependency.

## Usage

```js
const { TokenBucket } = require('./rate-limiting');

const limiter = new TokenBucket({ capacity: 5, refillPerSecond: 1 });

function handleRequest() {
  if (!limiter.tryConsume()) {
    return shed(); // no tokens available — reject/shed the request
  }
  return process();
}
```

## API

- `new TokenBucket({ capacity, refillPerSecond })` — `capacity` (default `5`) is the max/starting tokens; `refillPerSecond` (default `1`) is the steady refill rate, capped at `capacity`.
- `bucket.tryConsume(count = 1)` — consumes `count` tokens and returns `true` if available, otherwise returns `false` (the caller should shed/reject).
- `bucket.availableTokens` — current token count after applying any pending refill.
