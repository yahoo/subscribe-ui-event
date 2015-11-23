/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

'use strict';

var jsdom = require('node-jsdom');
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.parentWindow;
global.navigator = window.navigator;
global.Event = window.Event;

var env = {
    eventHandlers: {}
};

window = {
    addEventListener: function (type, cb) {
        env.eventHandlers[type] = cb;
    },
    removeEventListener: function (type, cb) {
        env.eventHandlers[type] = undefined;
    },
    setTimeout: function (cb, wait) {
        cb();
    },
    requestAnimationFrame: function (cb) {
        cb();
    },
    cancelAnimationFrame: function () {
    },
    innerWidth: 20
};
document = {
    documentElement: {
        scrollTop: 10
    },
    body: {
        scrollTop: 0
    },
    addEventListener: function (type, cb) {
        env.eventHandlers[type] = cb;
    },
    removeEventListener: function (type, cb) {
        env.eventHandlers[type] = undefined;
    }
};

module.exports = env;
