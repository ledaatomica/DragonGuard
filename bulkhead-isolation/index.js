'use strict';

class BulkheadRejectedError extends Error {
  constructor(poolName) {
    super(`Bulkhead "${poolName}" is at capacity`);
    this.name = 'BulkheadRejectedError';
    this.poolName = poolName;
  }
}

class Bulkhead {
  constructor({ name = 'default', maxConcurrent = 4 } = {}) {
    this.name = name;
    this.maxConcurrent = maxConcurrent;
    this.active = 0;
  }

  get available() {
    return this.maxConcurrent - this.active;
  }

  async run(fn) {
    if (this.active >= this.maxConcurrent) {
      throw new BulkheadRejectedError(this.name);
    }

    this.active += 1;
    try {
      return await fn();
    } finally {
      this.active -= 1;
    }
  }
}

module.exports = { Bulkhead, BulkheadRejectedError };
