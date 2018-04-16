/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
import assign from 'lodash/assign';
import globalVars from '../globalVars';

var defaultEventOption = {
  capture: false,
  passive: false
};

/**
 * Cross-browser addEventListener.
 * @method listen
 * @param {Object} target - The target to add event listener.
 * @param {String} eventType - The event type.
 * @param {Function} handler - The event handler.
 * @param {Object} handler - The options object that specifies characteristics about the event listener.
 * @return {Object} The object to be able to remove the handler.
 */
function listen(target, eventType, handler, options) {
  let add = 'addEventListener';
  let remove = 'removeEventListener';
  const eventOptions = globalVars.supportPassiveEvent ? assign({}, defaultEventOption, options) : false;

  if (!target.addEventListener && target.attachEvent) {
    add = 'attachEvent';
    remove = 'detachEvent';
    eventType = 'on' + eventType;
  }
  target[add](eventType, handler, eventOptions);

  return {
    remove: function() {
      target[remove](eventType, handler);
    }
  };
}

export default listen;
