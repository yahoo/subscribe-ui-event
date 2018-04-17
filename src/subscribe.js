/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import globalVars from './globalVars';
import leIE8 from './lib/leIE8'; // less then or equal to IE8
import mainEventConnectors from './mainEventConnectors';

// constants
import { DEFAULT_THROTTLE_RATE } from './constants';

/**
 * Subscribe to UI events.
 * @method subscribe
 * @param {String} type - The type of event.
 * @param {Function} cb - The callback function.
 * @param {Object} options.context - The caller.
 * @param {Number} options.throttleRate - The amount of time for throttling.
 * @param {Boolean} options.useRAF - Use rAF for throttling if true.
 * @param {Object} options.eventOptions - Option to pass to event listener
 * @return {Object} The object with unsubscribe function.
 */
function subscribe(type, cb, options = {}) {
  const useRAF = options.useRAF || false;
  let throttleRate = parseInt(options.throttleRate, 10);
  const eventOptions = options.eventOptions;

  if (isNaN(throttleRate)) {
    throttleRate = DEFAULT_THROTTLE_RATE;
  }

  if (useRAF) {
    throttleRate = 'raf';
  }

  // turn off throttle if the browser is IE8 or less, because window.event will be reset
  // when using any delayed function, i.g., setTimeout, or rAF.
  if (leIE8) {
    throttleRate = 0;
  }

  // once those variables enabled, then never disabled.
  globalVars.enableScrollInfo = globalVars.enableScrollInfo || options.enableScrollInfo || false;
  globalVars.enableResizeInfo = globalVars.enableResizeInfo || options.enableResizeInfo || false;
  globalVars.enableTouchInfo = globalVars.enableTouchInfo || options.enableTouchInfo || false;

  return mainEventConnectors[type](throttleRate, cb, options, eventOptions);
}

export default subscribe;
