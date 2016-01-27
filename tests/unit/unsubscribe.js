/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

'use strict';

var env = require('../lib/setup');

var globalVars = require('../../../src/globalVars');

var expect = require('expect.js');
var subscribe = require('../../../src/subscribe');
var unsubscribe = require('../../../src/unsubscribe');

describe('unsubscribe', function () {
    describe('#unsubscribe', function () {
        it('scroll should be triggered by window scroll', function () {
            var fn = function (e, ae) {
            };
            var subscription = subscribe('scroll', fn);
            unsubscribe('scroll', fn);
            expect(globalVars.removers.length).equal(0);
        });
    });
});
