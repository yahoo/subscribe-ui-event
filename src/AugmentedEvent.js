/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
 /* global window, document */

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
var touch = {
    axisIntention: '',
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0
};

var INTENTION_THRESHOLD = 5;

/**
 * ArgmentedEvent will hold some global information, such like window scroll postion,
 * so that those information is only calculated once.
 * @param {Object} option - The option for SyntheticEvent
 */
function ArgmentedEvent(option) {
    option = option || {};
    var mainType = (option.mainType || '').toLowerCase();
    var subType = (option.subType || '').toLowerCase();

    this.mainType = mainType;
    this.subType = subType;
    this.type = mainType + subType.charAt(0).toUpperCase() + subType.slice(1) || '';
    this.scroll = scroll;
    this.resize = resize;
    this.touch = touch;
}

ArgmentedEvent.prototype = {
    getXY: function (touch) {
        var t = { x: 0, y: 0};
        var docBody = document.body;
        var docEl = document.documentElement;

        if (touch.pageX || touch.pageY) {
            t.x = touch.pageX;
            t.y = touch.pageY;
        } else {
            t.x = touch.clientX + docBody.scrollLeft + docEl.scrollLeft;
            t.y = touch.clientY + docBody.scrollTop + docEl.scrollTop;
        }

        return t;
    },

    update: function update(e) {
        var mainType = this.mainType;
        var subType = this.subType;
        var docEl = document.documentElement;

        if (globalVars.enableScrollInfo && (mainType === 'scroll' || mainType === 'touchmove')) {
            var top = docEl.scrollTop + document.body.scrollTop;
            // Prevent delta from being 0
            if (top !== this.scroll.top) {
                this.scroll.delta = top - this.scroll.top;
                this.scroll.top = top;
            }
        }
        if (globalVars.enableResizeInfo && mainType === 'resize') {
            this.resize.width = window.innerWidth || docEl.clientWidth;
            this.resize.height = window.innerHeight || docEl.clientHeight;
        }
        if (globalVars.enableTouchInfo && e.touches &&
            (mainType === 'touchstart' || mainType === 'touchmove' || mainType === 'touchend')
        ) {
            var pos;
            var absX;
            var absY;
            if (mainType === 'touchstart' || subType === 'start') {
                pos = this.getXY(e.touches[0]);
                this.touch.axisIntention = '';
                this.touch.startX = pos.x;
                this.touch.startY = pos.y;
                this.touch.deltaX = 0;
                this.touch.deltaY = 0;
            } else if (mainType === 'touchmove') {
                pos = this.getXY(e.touches[0]);
                this.touch.deltaX = pos.x - this.touch.startX;
                this.touch.deltaY = pos.y - this.touch.startY;
                if (this.touch.axisIntention === '') {
                    absX = Math.abs(this.touch.deltaX);
                    absY = Math.abs(this.touch.deltaY);
                    if (absX > INTENTION_THRESHOLD && absX >= absY) {
                        this.touch.axisIntention = 'x';
                    } else if (absY > INTENTION_THRESHOLD && absY > absX) {
                        this.touch.axisIntention = 'y';
                    }
                }
            }
        }
    }
};

module.exports = ArgmentedEvent;
