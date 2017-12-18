/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var EventEmitter = require('eventemitter3');
var supportPassiveEvent = require('./lib/supportPassiveEvent');

module.exports = {
    connections: {},
    EE: new EventEmitter(),
    enableResizeInfo: false,
    enableScrollInfo: false,
    listeners: {},
    removers: [],
    supportPassiveEvent: supportPassiveEvent
};
