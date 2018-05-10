/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import globalVars from './globalVars';

const { removers } = globalVars;

/**
 * Unsubscribe to UI events.
 * @method unsubscribe
 * @param {String} type - The type of event.
 * @param {Function} cb - The callback function.
 */
function unsubscribe(type, cb) {
  let remover;
  for (let i = removers.length - 1; i >= 0; i -= 1) {
    remover = removers[i];
    if (remover._cb === cb && remover._type.indexOf(type) >= 0) {
      remover.unsubscribe();
      removers.splice(i, 1);
    }
  }
}

export default unsubscribe;
