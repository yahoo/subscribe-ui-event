/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var globalVars = require('./globalVars');
var leIE8 = require('./lib/leIE8'); // less then or equal to IE8
var mainEventConnectors = require('./mainEventConnectors');

// constants
var DEFAULT_THROTTLE_RATE = require('./constants').DEFAULT_THROTTLE_RATE;

/**
 * Subscribe to UI events.
 * @method subscribe
 * @param {String} type - The type of event.
 * @param {Function} cb - The callback function.
 * @param {Object} options.context - The caller.
 * @param {Number} options.throttleRate - The amount of time for throttling.
 * @param {Boolean} options.useRAF - Use rAF for throttling if true.
 * @param {Boolean} options.passive - Register as passive event
 * @return {Object} The object with unsubscribe function.
 */
function subscribe(type, cb, options) {
    options = options || {};

    var useRAF = options.useRAF || false;
    var throttleRate = parseInt(options.throttleRate, 10);

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

    return mainEventConnectors[type](throttleRate, cb, options);
}

module.exports = subscribe;
