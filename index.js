/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var listenLib = require('./dist/lib/listen');
var subscribeLib = require('./dist/subscribe');
var unsubscribeLib = require('./dist/unsubscribe');

var IS_CLIENT = typeof window !== 'undefined';

function warn() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Warning: the function is client-side only, does not work on server side'); // eslint-disable-line
  }
}

module.exports = {
  listen: IS_CLIENT ? listenLib : warn,
  subscribe: IS_CLIENT ? subscribeLib : warn,
  unsubscribe: IS_CLIENT ? unsubscribeLib : warn
};
