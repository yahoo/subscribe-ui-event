/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

'use strict';

var ee = require('../../../src/eventEmitter').eventEmitter;

var expect = require('expect.js');
var subscribe;

describe('subscribe-ie8', function () {
    before(function () {
        GLOBAL.window = {
            attachEvent: function (eventType, cb) {
                eventType = eventType.replace('on', '');
                ee.on(eventType, cb);
            },
            detachEvent: function (eventType, cb) {
                ee.removeListener(eventType, cb);
            },
            setTimeout: function (cb, wait) {
                cb();
            }
        };
        GLOBAL.document = {
            attachEvent: function (eventType, cb) {
                ee.on(eventType, cb);
            },
            detachEvent: function (eventType, cb) {
                ee.removeListener(eventType, cb);
            }
        };
        GLOBAL.navigator = {
            userAgent: 'MSIE 1.0'
        };
    });

    after(function () {
        GLOBAL.window = undefined;
        GLOBAL.document = undefined;
        GLOBAL.navigator = undefined;
    });

    beforeEach(function () {
        require.cache[require.resolve('../../../src/eventHandlers')] = undefined;
        require.cache[require.resolve('../../../src/lib/leIE8')] = undefined;
        require.cache[require.resolve('../../../src/subscribe')] = undefined;
        subscribe = require('../../../src/subscribe');

        ee.removeAllListeners('scroll');
        ee.removeAllListeners('resize');
        ee.removeAllListeners('visibilitychange');
    });

    describe('#subscribe', function () {
        it('scroll should be triggered by window scroll', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                subscription.unsubscribe();
                done();
            });

            // simulate window scroll event
            ee.emit('scroll', {foo: 'foo'});
        });

        it('scrollStart and scrollEnd should be triggered by the start/end of window scroll', function (done) {
            var subscription1 = subscribe('scrollStart', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scrollStart');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('scrollEnd', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scrollEnd');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            ee.emit('scroll', {foo: 'foo'});
        });
    });
});
