# Bulkhead Isolation

Caps concurrent calls to a dependency in an isolated pool, so one overwhelmed
dependency can't exhaust resources shared by unrelated calls.

## Usage

```js
const { Bulkhead, BulkheadRejectedError } = require('./bulkhead-isolation');

const recommendationsPool = new Bulkhead({ name: 'recommendations', maxConcurrent: 4 });
const checkoutPool = new Bulkhead({ name: 'checkout', maxConcurrent: 4 });

try {
  await recommendationsPool.run(() => callRecommendationsService());
} catch (err) {
  if (err instanceof BulkheadRejectedError) {
    // pool is full; shed this request instead of queuing it
  }
}

// checkoutPool is unaffected even if recommendationsPool is saturated
await checkoutPool.run(() => callCheckoutService());
```

## API

- `new Bulkhead({ name, maxConcurrent })` — a fixed-capacity pool. `maxConcurrent` (default `4`).
- `bulkhead.run(fn)` — runs `fn()` if the pool has room, tracking it as active until it settles. If the pool is full, rejects immediately with `BulkheadRejectedError` (fail-fast/shed, no queueing).
- `bulkhead.available` — free slots remaining in the pool.
