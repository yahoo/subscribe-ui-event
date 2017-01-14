/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var globalVars = require('../globalVars');

/**
 * Cross-browser addEventListener.
 * @method listen
 * @param {Object} target - The target to add event listener.
 * @param {String} eventType - The event type.
 * @param {Function} handler - The event handler.
 * @param {Boolean} passive - A Bool indicating whether or not to register mainEvent as passive event
 * @return {Object} The object to be able to remove the handler.
 */
function listen(target, eventType, handler, listen, passive) {
    var add = 'addEventListener';
    var remove = 'removeEventListener';

    if (!target.addEventListener && target.attachEvent) {
        add = 'attachEvent';
        remove = 'detachEvent';
        eventType = 'on' + eventType;
    }

    target[add](eventType,
        handler,
        passive && globalVars.supportsPassive ? { passive: true } : false
    );

    return {
        remove: function() {
            target[remove](eventType, handler);
        }
    };
}

module.exports = listen;
