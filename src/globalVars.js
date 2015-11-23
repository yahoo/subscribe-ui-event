/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var EventEmitter = require('eventemitter3');

module.exports = {
    EE: new EventEmitter(),
    connections: {},
    listeners: {},
    enableScrollInfo: false,
    enableResizeInfo: false
};
