/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import rAF from 'raf';

const getTime =
  Date.now ||
  /* istanbul ignore next */ function () {
    return new Date().getTime();
  };

function rAFThrottle(func, throttle = 15) {
  let context;
  let args;
  let last = 0;
  let requestId = 0;

  const later = function () {
    const now = getTime();
    const remaining = throttle - (now - last);

    if (remaining <= 0) {
      last = now;
      requestId = 0;
      func.apply(context, args);
    } else {
      requestId = rAF(later);
    }
  };

  return function throttledFunc() {
    context = this;
    args = arguments; // eslint-disable-line prefer-rest-params

    if (!requestId) {
      requestId = rAF(later);
    }
  };
}

export default rAFThrottle;
