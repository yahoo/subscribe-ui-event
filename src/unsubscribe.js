/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var removers = require('./globalVars').removers;

/**
 * Unsubscribe to UI events.
 * @method unsubscribe
 * @param {String} type - The type of event.
 * @param {Function} cb - The callback function.
 */
function unsubscribe(type, cb, options) {
    var remover;
    for (var i = removers.length - 1; i >= 0; i--) {
        remover = removers[i];
        if (remover._cb === cb && remover._type.indexOf(type) >= 0) {
            remover.unsubscribe();
            removers.splice(i, 1);
        }
    }
}

module.exports = unsubscribe;
