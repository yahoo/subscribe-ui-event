/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, beforeEach */

'use strict';

var env = require('../lib/setup');

var globalVars = require('../../../src/globalVars');
var ee = require('../../../src/globalVars').EE;

var expect = require('expect.js');
var subscribe;

describe('subscribe-ie8', function () {
    before(function () {
        // navigator.userAgent = 'MSIE 1.0';
        Object.defineProperty(navigator, 'userAgent', {
            get: function() {
                return 'MSIE 1.0';
            }
        });
        window.addEventListener = null;
        window.removeEventListener = null;
        document.addEventListener = null;
        document.removeEventListener = null;
        require.cache[require.resolve('../../../src/lib/leIE8')] = undefined;
        require.cache[require.resolve('../../../src/subscribe')] = undefined;
        require.cache[require.resolve('../../../src/mainEventConnectors')] = undefined;
    });

    after(function () {
        Object.defineProperty(navigator, 'userAgent', {
            get: function() {
                return '';
            }
        });
        window.addEventListener = window.attachEvent;
        window.removeEventListener = window.detachEvent;
        document.addEventListener = document.attachEvent;
        document.removeEventListener = document.detachEvent;
    });

    beforeEach(function () {
        subscribe = require('../../../src/subscribe');
    });

    describe('#subscribe', function () {
        it('scroll should be triggered by window scroll without throttling', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                expect(subscription._type).equal('scroll:0');
                subscription.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.onscroll({foo: 'foo'});
        });

        it('scrollStart and scrollEnd should be triggered by the start/end without throttling', function (done) {
            var subscription1 = subscribe('scrollStart', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scrollStart');
                expect(subscription1._type).equal('scrollStart:0');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('scrollEnd', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scrollEnd');
                expect(subscription2._type).equal('scrollEnd:0');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.onscroll({foo: 'foo'});
        });
    });
});
