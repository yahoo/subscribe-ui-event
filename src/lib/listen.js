/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var _assign = require('lodash/assign');
var globalVars = require('../globalVars');

var defaultEventOption = {
  capture: false,
  passive: true
};

/**
 * Cross-browser addEventListener.
 * @method listen
 * @param {Object} target - The target to add event listener.
 * @param {String} eventType - The event type.
 * @param {Function} handler - The event handler.
 * @param {Object} handler - The options object that specifies characteristics about the event listener.
 * @return {Object} The object to be able to remove the handler.
 */
function listen(target, eventType, handler, options) {
    var add = 'addEventListener';
    var remove = 'removeEventListener';
    var eventOptions = globalVars.supportPassiveEvent ? _assign({}, defaultEventOption, options) : false;

    if (!target.addEventListener && target.attachEvent) {
        add = 'attachEvent';
        remove = 'detachEvent';
        eventType = 'on' + eventType;
    }
    target[add](eventType, handler, eventOptions);

    return {
        remove: function() {
            target[remove](eventType, handler);
        }
    };
}

module.exports = listen;
