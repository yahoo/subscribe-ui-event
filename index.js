/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function warn() {
    if ('production' !== process.env.NODE_ENV) {
        console.warn('Warning: the function is client-side only, does not work on server side');
    }
}

if (typeof window !== 'undefined') {
    module.exports = {
        listen: require('./dist/lib/listen'),
        subscribe: require('./dist/subscribe'),
        unsubscribe: require('./dist/unsubscribe')
    };
} else {
    module.exports = {
        listen: warn,
        subscribe: warn,
        unsubscribe: warn
    };
}
