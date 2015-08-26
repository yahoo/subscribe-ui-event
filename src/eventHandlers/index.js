/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */

'use strict';

var AugmentedEvent = require('../AugmentedEvent');
var ee = require('../eventEmitter').eventEmitter;
var leIE8 = require('../lib/leIE8');

var EVENT_END_DELAY = 200;

/**
 * This is designed for cloning event object and IE8 event object doesn't have hasOwnProperty(),
 * so no hasOwnProperty() being used in for loop.
 * @method copyEventObj
 * @param {Object} o - The object to be cloned.
 * @return {Object} The cloned object.
 */
function copyEventObj(o) {
    var r = {};
    for (var i in o) {
        // jslint will compain if there is no 'if' in for-in loop.
        if (true) {
            r[i] = o[i];
        }
    }
    return r;
}

/**
 * Cross-browser addEventListener.
 * @method listen
 * @param {Object} target - The target to add event listener.
 * @param {String} eventType - The event type.
 * @param {Function} handler - The event handler.
 * @return {Object} The object to be able to remove the handler.
 */
function listen(target, eventType, handler) {
    var add = 'addEventListener';
    var remove = 'removeEventListener';

    if (!target.addEventListener && target.attachEvent) {
        add = 'attachEvent';
        remove = 'detachEvent';
        eventType = 'on' + eventType;
    }
    target[add](eventType, handler, false);

    return {
        remove: function() {
            target[remove](eventType, handler);
        }
    };
}

/**
 * Generate the start or end of those continuous event, such like scroll and resize.
 * @method generateEdgeEventHandler
 * @param {Object} target - The event target, usually window or document.
 * @param {String} eventType - The event type.
 * @param {Boolean} eventStart - true for the event start, otherwise the event end.
 * @return {Function} The function to generate throttle event.
 */
function generateEdgeEventHandler(target, eventType, eventStart) {
    return function(eeType, options) {
        if (ee.listeners(eeType, true)) {
            return;
        }

        var throttleRate = options.throttleRate;
        var throttle = options.throttleFunc;
        var augmentedEvent = new AugmentedEvent({type: eventType + (eventStart ? 'Start' : 'End')});
        var timer;

        function eventEndCallback(e) {
            if (!eventStart) {
                ee.emit(eeType, e, augmentedEvent);
            }
            timer = null;
        }

        function eventHandler(e) {
            if (!timer) {
                if (eventStart) {
                    ee.emit(eeType, e, augmentedEvent);
                }
            }

            clearTimeout(timer);
            if (leIE8) {
                e = copyEventObj(e);
            }

            if (eventEndCallback.bind) {
                timer = setTimeout(eventEndCallback.bind(null, e), throttleRate + EVENT_END_DELAY);
            } else {
                timer = setTimeout(function eventEndDelay() {
                    eventEndCallback(e);
                }, throttleRate + EVENT_END_DELAY);
            }
        }

        var handler = throttle(eventHandler, throttleRate);
        listen(target, eventType, handler);
    };
}

/**
 * Generate thea continuous event, such like scroll and resize.
 * @method generateContinuousEventHandler
 * @param {Object} target - The event target, usually window or document.
 * @param {String} eventType - The event type.
 * @param {Boolean} eventStart - true for the event start, otherwise the event end.
 * @return {Function} The function to generate throttle event.
 */
function generateContinuousEventHandler(target, eventType, noThrottle) {
    var enableScrollTop = false;
    return function(eeType, options) {
        if (ee.listeners(eeType, true)) {
            return;
        }

        var throttleRate = options.throttleRate;
        var throttle = options.throttleFunc;
        var augmentedEvent = new AugmentedEvent({type: eventType});
        enableScrollTop = enableScrollTop || options.enableScrollTop;

        function eventHandler(e) {
            var ae = augmentedEvent;
            var top;
            if (enableScrollTop && ae.type === 'scroll') {
                top = document.documentElement.scrollTop + document.body.scrollTop;
                ae.scroll.delta = top - ae.scroll.top;
                ae.scroll.top = top;
            }
            ee.emit(eeType, e, ae);
        }

        var handler = (!noThrottle && throttleRate > 0) ? throttle(eventHandler, throttleRate) : eventHandler;
        listen(target, eventType, handler);
    };
}

function viewportchange(eeType, options) {
    if (ee.listeners(eeType, true)) {
        return;
    }

    var throttleRate = options.throttleRate;
    var throttle = options.throttleFunc;
    var augmentedEvent = new AugmentedEvent({type: 'viewportchange'});
    function eventHandler(e) {
        ee.emit(eeType, e, augmentedEvent);
    }

    var handler = throttleRate > 0 ? throttle(eventHandler, throttleRate) : eventHandler;
    listen(window, 'scroll', handler);
    listen(window, 'resize', handler);
    // no throttle for visibilitychange, otherwise will call twice
    listen(document, 'visibilitychange', eventHandler);
}

module.exports = {
    resize: generateContinuousEventHandler(window, 'resize'),
    resizeEnd: generateEdgeEventHandler(window, 'resize', false),
    resizeStart: generateEdgeEventHandler(window, 'resize', true),
    scroll: generateContinuousEventHandler(window, 'scroll'),
    scrollEnd: generateEdgeEventHandler(window, 'scroll', false),
    scrollStart: generateEdgeEventHandler(window, 'scroll', true),
    viewportchange: viewportchange,
    visibilitychange: generateContinuousEventHandler(document, 'visibilitychange', true)
};
