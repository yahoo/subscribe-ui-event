/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */

'use strict';

var AugmentedEvent = require('../AugmentedEvent');
var ee = require('../eventEmitter').eventEmitter;
var ehs = require('../eventEmitter').eventHandlers;
var leIE8 = require('../lib/leIE8');

// constants
var EVENT_END_DELAY = 200;

// global variables
var doc;
var docBody;
var docEl;
var enableResizeInfo = false;
var enableScrollInfo = false;
var win;

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    win = window;
    doc = document;
    docEl = doc.documentElement;
    docBody = doc.body;
}

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
 * Update global scroll/resize info
 * @param {Object} ae - The additional event object
 * @param {String} eventType - The event type
 */
function updateAdditionalInfo(ae, eventType) {
    var top;
    if (enableScrollInfo && eventType === 'scroll') {
        top = docEl.scrollTop + docBody.scrollTop;
        // Prevent delta from being 0
        if (top !== ae.scroll.top) {
            ae.scroll.delta = top - ae.scroll.top;
            ae.scroll.top = top;
        }
    } else if (enableResizeInfo && eventType === 'resize') {
        ae.resize.width = win.innerWidth || docEl.clientWidth;
        ae.resize.height = win.innerHeight || docEl.clientHeight;
    }
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
        // One subscription needs scroll/resize info, all will get those information
        enableScrollInfo = enableScrollInfo || options.enableScrollInfo;
        enableResizeInfo = enableResizeInfo || options.enableResizeInfo;

        if (ee.listeners(eeType, true)) {
            return;
        }

        var throttleRate = options.throttleRate;
        var throttle = options.throttleFunc;
        var ae = new AugmentedEvent({type: eventType + (eventStart ? 'Start' : 'End')});
        var timer;

        function eventEndCallback(e) {
            if (!eventStart) {
                updateAdditionalInfo(ae, eventType);
                ee.emit(eeType, e, ae);
            }
            timer = null;
        }

        function eventHandler(e) {
            if (!timer) {
                if (eventStart) {
                    updateAdditionalInfo(ae, eventType);
                    ee.emit(eeType, e, ae);
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
        ehs[eeType] = listen(target, eventType, handler);
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
    return function(eeType, options) {
        // One subscription needs scroll/resize info, all will get those information
        enableScrollInfo = enableScrollInfo || options.enableScrollInfo;
        enableResizeInfo = enableResizeInfo || options.enableResizeInfo;

        if (ee.listeners(eeType, true)) {
            return;
        }

        var throttleRate = options.throttleRate;
        var throttle = options.throttleFunc;
        var ae = new AugmentedEvent({type: eventType});

        function eventHandler(e) {
            updateAdditionalInfo(ae, eventType);
            ee.emit(eeType, e, ae);
        }

        var handler = (!noThrottle && throttleRate > 0) ? throttle(eventHandler, throttleRate) : eventHandler;
        ehs[eeType] = listen(target, eventType, handler);
    };
}

function viewportchange(eeType, options) {
    if (ee.listeners(eeType, true)) {
        return;
    }

    var throttleRate = options.throttleRate;
    var throttle = options.throttleFunc;
    var ae = new AugmentedEvent({type: 'viewportchange'});
    function eventHandler(e) {
        ee.emit(eeType, e, ae);
    }

    var handler = throttleRate > 0 ? throttle(eventHandler, throttleRate) : eventHandler;

    ehs[eeType] = {
        remove: function () {
            for (var i = 0, l = this._handlers; i < l; i++) {
                this._handlers[i].remove();                
            }
        },
        _handlers: [
            listen(win, 'scroll', handler),
            listen(win, 'resize', handler),
            // no throttle for visibilitychange, otherwise will call twice
            listen(win, 'visibilitychange', eventHandler)
        ]
    };
}

module.exports = {
    resize: generateContinuousEventHandler(win, 'resize'),
    resizeEnd: generateEdgeEventHandler(win, 'resize', false),
    resizeStart: generateEdgeEventHandler(win, 'resize', true),
    scroll: generateContinuousEventHandler(win, 'scroll'),
    scrollEnd: generateEdgeEventHandler(win, 'scroll', false),
    scrollStart: generateEdgeEventHandler(win, 'scroll', true),
    viewportchange: viewportchange,
    visibilitychange: generateContinuousEventHandler(doc, 'visibilitychange', true)
};
