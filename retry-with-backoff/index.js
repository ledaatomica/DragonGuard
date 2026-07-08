'use strict';

class RetryExhaustedError extends Error {
  constructor(attempts, lastError) {
    super(`Gave up after ${attempts} attempts: ${lastError && lastError.message}`);
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

async function retryWithBackoff(fn, {
  maxAttempts = 4,
  baseDelayMs = 350,
  factor = 2,
  onAttempt = () => {},
} = {}) {
  let delay = baseDelayMs;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(attempt);
      onAttempt({ attempt, success: true });
      return result;
    } catch (err) {
      lastError = err;
      onAttempt({ attempt, success: false, error: err });
      if (attempt === maxAttempts) break;
      await sleep(delay);
      delay *= factor;
    }
  }

  throw new RetryExhaustedError(maxAttempts, lastError);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { retryWithBackoff, RetryExhaustedError };
