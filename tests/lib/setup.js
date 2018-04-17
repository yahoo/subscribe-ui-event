/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
const { window } = dom;
const document = window.document;

global.document = document;
global.window = window;
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

window.addEventListener = addEventListener;
window.removeEventListener = removeEventListener;
window.attachEvent = addEventListener;
window.detachEvent = removeEventListener;
window.setTimeout = (cb, wait) => {
  cb();
};
window.requestAnimationFrame = (cb) => {
  cb();
};
window.cancelAnimationFrame = () => {};
window.innerWidth = 20;

document.documentElement.scrollTop = 10;
document.documentElement.scrollLeft = 0;
document.body.scrollTop = 0;
document.body.scrollLeft = 0;
document.body.addEventListener = addEventListener;
document.body.removeEventListener = removeEventListener;
document.body.attachEvent = addEventListener;
document.body.detachEvent = removeEventListener;

document.addEventListener = addEventListener;
document.removeEventListener = removeEventListener;
document.attachEvent = addEventListener;
document.detachEvent = removeEventListener;

module.exports = env;
