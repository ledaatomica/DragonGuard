'use strict';

const STATE = Object.freeze({
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half-open',
});

class CircuitBreaker {
  constructor({
    failureThreshold = 3,
    resetTimeoutMs = 3000,
    onStateChange = () => {},
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.onStateChange = onStateChange;

    this.state = STATE.CLOSED;
    this.consecutiveFailures = 0;
    this.openedAt = null;
  }

  async call(fn, fallback) {
    if (!this._canAttempt()) {
      if (fallback) return fallback();
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _canAttempt() {
    if (this.state !== STATE.OPEN) return true;

    // Only leave OPEN once the cooldown window has fully elapsed.
    if (Date.now() - this.openedAt >= this.resetTimeoutMs) {
      this._transition(STATE.HALF_OPEN);
      return true;
    }
    return false;
  }

  _onSuccess() {
    this.consecutiveFailures = 0;
    this._transition(STATE.CLOSED);
  }

  _onFailure() {
    this.consecutiveFailures += 1;
    // Any failure while probing in HALF_OPEN immediately re-trips the breaker.
    if (this.state === STATE.HALF_OPEN || this.consecutiveFailures >= this.failureThreshold) {
      this.openedAt = Date.now();
      this._transition(STATE.OPEN);
    }
  }

  _transition(state) {
    if (this.state === state) return;
    this.state = state;
    this.onStateChange(state);
  }
}

module.exports = { CircuitBreaker, STATE };
