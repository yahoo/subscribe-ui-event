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

function addEventListener (type, cb) {
    env.eventHandlers[type] = cb;
}

function removeEventListener (type, cb) {
    env.eventHandlers[type] = undefined;
}

window = {
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    attachEvent: addEventListener,
    detachEvent: removeEventListener,
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
        scrollTop: 10,
        scrollLeft: 0
    },
    body: {
        scrollTop: 0,
        scrollLeft: 0,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        attachEvent: addEventListener,
        detachEvent: removeEventListener
    },
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    attachEvent: addEventListener,
    detachEvent: removeEventListener
};

module.exports = env;
