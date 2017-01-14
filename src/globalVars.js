/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var EventEmitter = require('eventemitter3');

// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;
if (typeof window !== 'undefined' && window.addEventListener) {
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener('test', null, opts);
    } catch (e) {}
}

module.exports = {
    connections: {},
    EE: new EventEmitter(),
    enableResizeInfo: false,
    enableScrollInfo: false,
    listeners: {},
    removers: [],
    supportsPassive: supportsPassive
};
