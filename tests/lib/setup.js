/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */


const jsdom = require('node-jsdom');

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.parentWindow;
global.navigator = window.navigator;
global.Event = window.Event;

const env = {
  eventHandlers: {}
};

function addEventListener(type, cb) {
  env.eventHandlers[type] = cb;
}

function removeEventListener(type, cb) {
  env.eventHandlers[type] = undefined;
}

window = {
  addEventListener,
  removeEventListener,
  attachEvent: addEventListener,
  detachEvent: removeEventListener,
  setTimeout(cb, wait) {
    cb();
  },
  requestAnimationFrame(cb) {
    cb();
  },
  cancelAnimationFrame() {},
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
    addEventListener,
    removeEventListener,
    attachEvent: addEventListener,
    detachEvent: removeEventListener
  },
  addEventListener,
  removeEventListener,
  attachEvent: addEventListener,
  detachEvent: removeEventListener
};

module.exports = env;
