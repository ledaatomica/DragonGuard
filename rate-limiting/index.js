'use strict';

class TokenBucket {
  constructor({ capacity = 5, refillPerSecond = 1 } = {}) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.tokens = capacity;
    this.lastRefillMs = Date.now();
  }

  get availableTokens() {
    this._refill();
    return this.tokens;
  }

  tryConsume(count = 1) {
    this._refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  _refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillMs) / 1000;
    const replenished = elapsedSec * this.refillPerSecond;

    if (replenished > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + replenished);
      this.lastRefillMs = now;
    }
  }
}

module.exports = { TokenBucket };
