/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var globalVars = require('./globalVars');
var resize = {
    width: 0,
    height: 0
};
var scroll = {
    delta: 0,
    top: 0
};

// global variables
var doc;
var docBody;
var docEl;
var win;

if (typeof window !== 'undefined') {
    win = window;
    doc = win.document || document;
    docEl = doc.documentElement;
    docBody = doc.body;
}

/**
 * ArgmentedEvent will hold some global information, such like window scroll postion,
 * so that those information is only calculated once.
 * @param {Object} option - The option for SyntheticEvent
 */
function ArgmentedEvent(option) {
    option = option || {};
    this.type = option.type || '';
    this.scroll = scroll;
    this.resize = resize;
}

ArgmentedEvent.prototype = {
    update: function update (mainType) {
        var top;

        if (globalVars.enableScrollInfo && mainType === 'scroll') {
            top = docEl.scrollTop + docBody.scrollTop;
            // Prevent delta from being 0
            if (top !== this.scroll.top) {
                this.scroll.delta = top - this.scroll.top;
                this.scroll.top = top;
            }
        } else if (globalVars.enableResizeInfo && mainType === 'resize') {
            this.resize.width = win.innerWidth || docEl.clientWidth;
            this.resize.height = win.innerHeight || docEl.clientHeight;
        }
    }
};

module.exports = ArgmentedEvent;
