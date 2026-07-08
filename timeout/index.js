'use strict';

class TimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

function withTimeout(fn, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs);

    Promise.resolve()
      .then(() => fn())
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

module.exports = { withTimeout, TimeoutError };
