/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
 /* global window, document, setTimeout */
'use strict';

var _clone = require('lodash.clone');
var _throttle = require('lodash.throttle');
var AugmentedEvent = require('./AugmentedEvent');
var connections = require('./globalVars').connections;
var EE = require('./globalVars').EE;
var globalVars = require('./globalVars');
var leIE8 = require('./lib/leIE8');
var listen = require('./lib/listen');
var listeners = require('./globalVars').listeners;
var rAFThrottle = require('./lib/rAFThrottle');
var subscriptions = require('./globalVars').subscriptions;

// constants
var EVENT_END_DELAY = require('./constants').EVENT_END_DELAY;

// global variables
var doc;
var win;

if (typeof window !== 'undefined') {
    win = window;
    doc = win.document || document;
}

/**
 * Connect a throttled event to a throttled main event, and return an event remover.
 * The number of connections to a throttled main event will be kept. If all throttled events
 * are removed, then remove throttled main event.
 * @method connectThrottle
 * @param {String} throttledEvent - A throttled event
 * @param {Function} cb - Callback function
 * @param {Object} ctx - The "this"
 * @param {String} throttledMainEvent - A throttled main event
 * @return {Object} An event remover
 */
function connectThrottle (throttledEvent, cb, ctx, throttledMainEvent) {
    EE.on(throttledEvent, cb, ctx);
    throttledMainEvent = throttledMainEvent || throttledEvent;
    connections[throttledMainEvent] = (connections[throttledMainEvent] || 0) + 1;
    return {
        _type: throttledEvent,
        _cb: cb,
        _ctx: ctx,
        unsubscribe: function unsubscribe () {
            if (!this._type) {
                return;
            }

            EE.removeListener(throttledEvent, cb, ctx);
            connections[throttledMainEvent]--;
            if (connections[throttledMainEvent] === 0) {
                listeners[throttledMainEvent].remove();
                listeners[throttledMainEvent] = undefined;
            }

            this._type = undefined;
            this._cb = undefined;
            this._ctx = undefined;
        }
    };
}

/**
 * Connect to event, event start and event end.
 * @method connectContinuousEvent
 * @param {Object} target - The target of a main event, window or document.
 * @param {String} mainEvent - A browser event, like scroll or resize.
 * @param {String} event - A subscribe event.
 */
function connectContinuousEvent (target, mainEvent, event) {
    return function throttleEvent (throttleRate, cb, context) {
        var throttledStartEvent = mainEvent + 'Start:' + throttleRate;
        var throttledEndEvent = mainEvent + 'End:' + throttleRate;
        var throttledMainEvent = mainEvent + ':' + throttleRate;
        var throttledEvent = event + ':' + throttleRate;

        var remover = connectThrottle(throttledEvent, cb, context, throttledMainEvent);

        if (listeners[throttledMainEvent]) {
            return remover;
        }

        var ae = {
            start: new AugmentedEvent({type: mainEvent + 'Start'}), // start
            main: new AugmentedEvent({type: mainEvent}), // main
            end: new AugmentedEvent({type: mainEvent + 'End'}), // end
        };

        // No throttle for throttleRate = 0
        if (throttleRate === 'raf') {
            throttleRate = 16; // Set as a number for setTimeout later.
            handler = rAFThrottle(handler);
        } else if (throttleRate > 0) {
            handler = _throttle(handler, throttleRate);
        }

        var timer;
        function endCallback (e) {
            ae.end.update(mainEvent);
            EE.emit(throttledEndEvent, e, ae.end);
            timer = null;
        }
        function handler (e) {
            ae.start.update(mainEvent);
            if (!timer) {
                EE.emit(throttledStartEvent, e, ae.start);
            }
            clearTimeout(timer);

            // No need to call ae.main.update(), because ae.start.update is called, everything is update-to-date.
            EE.emit(throttledMainEvent, e, ae.main);
            if (!leIE8) {
                timer = setTimeout(endCallback.bind(null, e), throttleRate + EVENT_END_DELAY);
            } else {
                // For browser less then and equal to IE8, event object need to be cloned for setTimeout.
                e = _clone(e);
                timer = setTimeout(function eventEndDelay() {
                    endCallback(e);
                }, throttleRate + EVENT_END_DELAY);
            }
        }

        listeners[throttledMainEvent] = listen(target, mainEvent, handler);
        return remover;
    };
}

function connectDiscreteEvent (target, event) {
    return function throttleEvent (throttleRate, cb, context) {
        // no throttling for discrete event
        var throttledEvent = event + ':0';

        var remover = connectThrottle(throttledEvent, cb, context);

        if (listeners[throttledEvent]) {
            return remover;
        }

        var ae = new AugmentedEvent({type: event});

        function handler (e) {
            ae.update(event);
            EE.emit(throttledEvent, e, ae);
        }

        listeners[throttledEvent] = listen(target, event, handler);
        return remover;
    };
}

module.exports = {
    scrollStart: connectContinuousEvent(win, 'scroll', 'scrollStart'),
    scrollEnd: connectContinuousEvent(win, 'scroll', 'scrollEnd'),
    scroll: connectContinuousEvent(win, 'scroll', 'scroll'),
    resizeStart: connectContinuousEvent(win, 'resize', 'resizeStart'),
    resizeEnd: connectContinuousEvent(win, 'resize', 'resizeEnd'),
    resize: connectContinuousEvent(win, 'resize', 'resize'),
    visibilitychange: connectDiscreteEvent(doc, 'visibilitychange'),
    touchmoveStart: connectContinuousEvent(win, 'touchmove', 'touchmoveStart'),
    touchmoveEnd: connectContinuousEvent(win, 'touchmove', 'touchmoveEnd'),
    touchmove: connectContinuousEvent(win, 'touchmove', 'touchmove'),
    touchstart: connectDiscreteEvent(doc, 'touchstart'),
    touchend: connectDiscreteEvent(doc, 'touchend'),
};
