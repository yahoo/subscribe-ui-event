/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

// less then or equal to IE8
let leIE8 = false; // eslint-disable-line

if (typeof navigator !== 'undefined') {
    const matches = navigator.userAgent.match(/MSIE (\d+\.\d+)/);
    if (matches) {
        leIE8 = parseFloat(matches[1], 10) < 9;
    }
}

export default leIE8;
