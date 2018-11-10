/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import listenLib from './dist-es/lib/listen';
import subscribeLib from './dist-es/subscribe';
import unsubscribeLib from './dist-es/unsubscribe';

var IS_CLIENT = typeof window !== 'undefined';

function warn() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Warning: the function is client-side only, does not work on server side'); // eslint-disable-line
  }
}

export var listen = IS_CLIENT ? listenLib : warn;
export var subscribe = IS_CLIENT ? subscribeLib : warn;
export var unsubscribe = IS_CLIENT ? unsubscribeLib : warn;
