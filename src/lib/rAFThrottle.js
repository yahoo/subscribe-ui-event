/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var rAF = require('raf');
var getTime = Date.now || function() {
    return new Date().getTime();
};
function rAFThrottle(func, throttle) {
    var context;
    var args;
    var last = 0;
    var requestId = 0;

    var later = function () {
        var now = getTime();
        var remaining = throttle - (now - last);

        if (remaining <= 0) {
            last = now;
            requestId = 0;
            func.apply(context, args);
        } else {
            requestId = rAF(later);
        }
    };

    return function throttledFunc() {
        context = this;
        args = arguments;

        if (!requestId) {
             requestId = rAF(later);
        }
    };
}

module.exports = rAFThrottle;
