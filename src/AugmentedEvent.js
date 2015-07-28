/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * ArgmentedEvent will hold some global information, such like window scroll postion,
 * so that those information is only calculated once.
 * @param {Object} option - The option for SyntheticEvent
 */
function ArgmentedEvent(option) {
    option = option || {};
    this.type = option.type || '';
}

module.exports = ArgmentedEvent;
