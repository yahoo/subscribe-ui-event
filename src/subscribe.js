/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var ee = require('./eventEmitter').eventEmitter;
var ehs = require('./eventEmitter').eventHandlers;
var emptyFunction = function () {};
var eventHandlers = require('./eventHandlers');
var leIE8 = require('./lib/leIE8'); // less then or equal to IE8
var rAFThrottle = require('./lib/rAFThrottle');
var subscriptions = require('./eventEmitter').subscriptions;
var throttle = require('lodash.throttle');

/**
 * Subscribe to UI events.
 * @method subscribe
 * @param {String} eventType - The type of event.
 * @param {Function} cb - The callback function.
 * @param {Object} options.context - The caller.
 * @param {Number} options.throttleRate - The amount of time for throttling.
 * @param {Boolean} options.useRAF - Use rAF for throttling if true.
 * @return {Object} The object with unsubscribe function.
 */
function subscribe(eventType, cb, options) {
    if (!eventHandlers[eventType] || !cb) {
        return {
            unsubscribe: emptyFunction
        };
    }

    options = options || {};

    var context = options.context || null;
    var eeType; // emitEmitterType =  eventType + ':' + throttle
    var enableScrollInfo = options.enableScrollInfo || false;
    var enableResizeInfo = options.enableResizeInfo || false;
    var sub;
    var throttleFunc;
    var throttleRate = parseInt(options.throttleRate);
    var useRAF = options.useRAF || false;

    throttleFunc = useRAF ? rAFThrottle : throttle;
    if (isNaN(throttleRate)) {
        throttleRate = useRAF ? 15 : 50; // 15ms will be equivalent to 1 rAF
    }

    // turn off throttle if the browser is IE8 or less, because window.event will be reset
    // when using any delayed function, i.g., setTimeout, or rAF.
    if (leIE8) {
        throttleRate = 0;
    }

    // eeType is throttled event type, such like "scroll:50", meaning scroll event with 50ms throttle rate
    eeType = eventType + ':' + throttleRate + (useRAF ? ':raf' : '');

    // wire UI event to throttled event, for example, wire "window.scroll" to "scroll:50"
    // add event listeners to UI event for the same throttled event
    eventHandlers[eventType](eeType, {
        enableScrollInfo: enableScrollInfo,
        enableResizeInfo: enableResizeInfo,
        throttleFunc: throttleFunc,
        throttleRate: throttleRate
    });

    // wire to throttled event
    ee.on(eeType, cb, context);

    // append sub to subscriptions
    sub = {
        _cb: cb,
        _eventType: eventType,
        unsubscribe: function () {
            var i = subscriptions.indexOf(sub);
            ee.removeListener(eeType, cb);
            if (i !== -1) {
                subscriptions.splice(i, 1);
            }
            if (!ee.listeners(eeType, true) && ehs[eeType]) {
                ehs[eeType].remove();
                ehs[eeType] = undefined;
            }
        }
    };
    subscriptions.push(sub);

    return sub;
}

module.exports = subscribe;
