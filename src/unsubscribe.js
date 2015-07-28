/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var subscriptions = require('./eventEmitter').subscriptions;

/**
 * Unsubscribe UI events. Note that all subscriptions having the same eventHandler and the same event type
 * will be unsubscribed together even if they have different options.
 * @method unsubscribe
 * @param {String} eventType - The type of event
 * @param {Function} cb - The callback function
 */
function unsubscribe(eventType, cb) {
    var sub;
    for (var i = subscriptions.length - 1; i >= 0; i--) {
        sub = subscriptions[i];
        if (sub._eventType === eventType && sub._cb === cb) {
            sub.unsubscribe();
        }
    }
}

module.exports = unsubscribe;
