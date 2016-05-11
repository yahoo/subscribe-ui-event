/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document, setTimeout */
'use strict';

var _clone = require('lodash/clone');
var _throttle = require('lodash/throttle');
var AugmentedEvent = require('./AugmentedEvent');
var globalVars = require('./globalVars');
var connections = globalVars.connections;
var EE = globalVars.EE;
var leIE8 = require('./lib/leIE8');
var listen = require('./lib/listen');
var listeners = globalVars.listeners;
var rAFThrottle = require('./lib/rAFThrottle');
var removers = globalVars.removers;
var subscriptions = globalVars.subscriptions;

// constants
var EVENT_END_DELAY = require('./constants').EVENT_END_DELAY;

// global variables
var doc;
var win;
var body;
var hashId = 0;

if (typeof window !== 'undefined') {
    win = window;
    doc = win.document || document;
    body = doc.body;
}

function getHash (domNode) {
    return domNode.id || 'target-id-' + hashId++;
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
function connectThrottle(throttledEvent, cb, ctx, throttledMainEvent) {
    EE.on(throttledEvent, cb, ctx);
    throttledMainEvent = throttledMainEvent || throttledEvent;
    connections[throttledMainEvent] = (connections[throttledMainEvent] || 0) + 1;
    return {
        _type: throttledEvent,
        _cb: cb,
        _ctx: ctx,
        unsubscribe: function unsubscribe() {
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

            // remove the remover from removers array
            for (var i = removers.length - 1; i >= 0; i--) {
                var remover = removers[i];
                if (remover === this) {
                    removers.splice(i, 1);
                    break;
                }
            }
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
function connectContinuousEvent(target, mainEvent, event) {
    return function throttleEvent(throttleRate, cb, options) {
        var context = options.context;
        var domTarget = options.target;
        var domId = domTarget && getHash(domTarget);
        var targetPart = domId ? ':' + domId : '';

        var throttledStartEvent = mainEvent + 'Start:' + throttleRate + targetPart;
        var throttledEndEvent = mainEvent + 'End:' + throttleRate + targetPart;
        var throttledMainEvent = mainEvent + ':' + throttleRate + targetPart;
        var throttledEvent = event + ':' + throttleRate + targetPart;

        var remover = connectThrottle(throttledEvent, cb, context, throttledMainEvent);
        removers.push(remover);

        if (listeners[throttledMainEvent]) {
            return remover;
        }

        var ae = {
            start: new AugmentedEvent({ mainType: mainEvent, subType: 'start' }), // start
            main: new AugmentedEvent({ mainType: mainEvent }), // main
            end: new AugmentedEvent({ mainType: mainEvent, subType: 'end' }) };

        // No throttle for throttleRate = 0
        // end
        if (throttleRate === 'raf') {
            throttleRate = 16; // Set as a number for setTimeout later.
            handler = rAFThrottle(handler);
        } else if (throttleRate > 0) {
            handler = _throttle(handler, throttleRate);
        }

        var timer;
        function endCallback(e) {
            ae.end.update(e);
            EE.emit(throttledEndEvent, e, ae.end);
            timer = null;
        }
        function handler(e) {
            if (!timer) {
                ae.start.update(e);
                EE.emit(throttledStartEvent, e, ae.start);
            }
            clearTimeout(timer);

            ae.main.update(e);
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

        listeners[throttledMainEvent] = listen(domTarget || target, mainEvent, handler);
        return remover;
    };
}

function connectDiscreteEvent(target, event) {
    return function throttleEvent(throttleRate, cb, options) {
        var context = options.context;
        var domTarget = options.target;
        var domId = domTarget && getHash(domTarget);

        // no throttling for discrete event
        var throttledEvent = event + ':0' + (domId ? ':' + domId : '');

        var remover = connectThrottle(throttledEvent, cb, context);
        removers.push(remover);

        if (listeners[throttledEvent]) {
            return remover;
        }

        var ae = new AugmentedEvent({ mainType: event });

        function handler(e) {
            ae.update(e);
            EE.emit(throttledEvent, e, ae);
        }

        listeners[throttledEvent] = listen(domTarget || target, event, handler);
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
    touchmoveStart: connectContinuousEvent(body, 'touchmove', 'touchmoveStart'),
    touchmoveEnd: connectContinuousEvent(body, 'touchmove', 'touchmoveEnd'),
    touchmove: connectContinuousEvent(body, 'touchmove', 'touchmove'),
    touchstart: connectDiscreteEvent(body, 'touchstart'),
    touchend: connectDiscreteEvent(body, 'touchend')
};
