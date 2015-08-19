/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

'use strict';

var ee = require('../../../src/eventEmitter').eventEmitter;

var expect = require('expect.js');
var subscribe;

describe('subscribe', function () {
    before(function () {
        GLOBAL.window = {
            addEventListener: function (eventType, cb) {
                ee.on(eventType, cb);
            },
            setTimeout: function (cb, wait) {
                cb();
            }
        };
        GLOBAL.document = {
            addEventListener: function (eventType, cb) {
                ee.on(eventType, cb);
            }
        };
        require.cache[require.resolve('../../../src/eventHandlers')] = undefined;
        require.cache[require.resolve('../../../src/lib/leIE8')] = undefined;
        require.cache[require.resolve('../../../src/subscribe')] = undefined;
    });

    after(function () {
        GLOBAL.window = undefined;
        GLOBAL.document = undefined;
    });

    beforeEach(function () {
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

        it('by default scroll should be triggered by scroll:50 (scroll with 50ms throttle)', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.bar).equal('bar');
                subscription.unsubscribe();
                done();
            });

            ee.emit('scroll:50', {foo: 'foo'}, {bar: 'bar'});
        });

        it('scroll with throttle = 100 should be triggered by scroll:100 (scroll with 100ms throttle)', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.bar).equal('bar');
                subscription.unsubscribe();
                done();
            }, {throttleRate: 100});

            ee.emit('scroll:100', {foo: 'foo'}, {bar: 'bar'});
        });

        it('scroll with rAF throttle should be triggered by window scroll', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                subscription.unsubscribe();
                done();
            }, {useRAF: true});

            ee.emit('scroll', {foo: 'foo'});
        });

        it('by default scroll with rAF throttle should be triggered by scroll:15:raf', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.bar).equal('bar');
                subscription.unsubscribe();
                done();
            }, {useRAF: true});

            ee.emit('scroll:15:raf', {foo: 'foo'}, {bar: 'bar'});
        });

        it('scroll with 50ms rAF throttle should be triggered by scroll:50:raf', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.bar).equal('bar');
                subscription.unsubscribe();
                done();
            }, {throttleRate: 50, useRAF: true});

            ee.emit('scroll:50:raf', {foo: 'foo'}, {bar: 'bar'});
        });

        it('viewportchange should be triggered by scroll, resize, and visibilitychange', function (done) {
            var fireCount = 0;
            var subscription = subscribe('viewportchange', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('viewportchange');
                fireCount++;
                if (fireCount === 3) {
                    subscription.unsubscribe();
                    done();
                }
            });

            ee.emit('scroll', {foo: 'foo'});
            ee.emit('resize', {foo: 'foo'});
            ee.emit('visibilitychange', {foo: 'foo'});
        });

        it('viewportchange should be triggered by viewportchange:50', function (done) {
            var subscription = subscribe('viewportchange', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.bar).equal('bar');
                subscription.unsubscribe();
                done();
            });

            ee.emit('viewportchange:50', {foo: 'foo'}, {bar: 'bar'});
        });

        it('should not fail if pass null arguments', function () {
            var subscription = subscribe('resize', null);
            subscription.unsubscribe();
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

        it('resizeStart and resizeEnd should be triggered by the start/end of window resize', function (done) {
            var subscription1 = subscribe('resizeStart', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('resizeStart');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('resizeEnd', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('resizeEnd');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            ee.emit('resize', {foo: 'foo'});
        });
    });
});
