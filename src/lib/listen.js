/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

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

module.exports = listen;
