/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

import EventEmitter from 'eventemitter3';
import supportPassiveEvent from './lib/supportPassiveEvent';

export default {
  connections: {},
  EE: new EventEmitter(),
  enableResizeInfo: false,
  enableScrollInfo: false,
  listeners: {},
  removers: [],
  supportPassiveEvent: supportPassiveEvent
};
