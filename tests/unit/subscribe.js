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
            removeEventListener: function (eventType, cb) {
                ee.removeListener(eventType, cb);
            },
            setTimeout: function (cb, wait) {
                cb();
            },
            innerWidth: 10
        };
        GLOBAL.document = {
            documentElement: {
                scrollTop: 10
            },
            body: {
                scrollTop: 0
            },
            addEventListener: function (eventType, cb) {
                ee.on(eventType, cb);
            },
            removeEventListener: function (eventType, cb) {
                ee.removeListener(eventType, cb);
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

        it('scroll should be triggered by window scroll with scroll information', function (done) {
            // the first one subscription should get scroll info as well, because the second one requests
            var subscription1 = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                expect(syntheticEvent.scroll.top).equal(10);
                subscription1.unsubscribe();
            }, {enableScrollInfo: false});

            // the second one request scroll info, which should dominate.
            var subscription2 = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                expect(syntheticEvent.scroll.top).equal(10);
                subscription2.unsubscribe();
                done();
            }, {enableScrollInfo: true});

            // simulate window scroll event
            ee.emit('scroll', {foo: 'foo'});
        });

        it('resize should be triggered by window resize with resize information', function (done) {
            // the first one subscription should get resize info as well, because the second one requests
            var subscription1 = subscribe('resize', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('resize');
                expect(syntheticEvent.resize.width).equal(10);
                subscription1.unsubscribe();
            }, {enableResizeInfo: false});

            var subscription2 = subscribe('resize', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('resize');
                expect(syntheticEvent.resize.width).equal(10);
                subscription2.unsubscribe();
                done();
            }, {enableResizeInfo: true});

            // simulate window resize event
            ee.emit('resize', {foo: 'foo'});
        });

        it('same event should be subscribed once', function (done) {
            // for continuous events
            var subscription1 = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scroll');
                subscription2.unsubscribe();
            });

            // Actually, ee never listens to those ui events, such like 'scroll', 'resize', and 'visibilitychange'.
            // It only listens to throttled events, like 'scroll:50', 'scroll:50:raf'.
            // ee.listeners('scroll') will increase because I mocked window.addEventListener above to listen to
            // 'scroll' event. The number of listeners will stay at 1 if the same event is subscribed multiple times.
            expect(ee.listeners('scroll').length).equal(1);
            // simulate window scroll event
            ee.emit('scroll', {foo: 'foo'});

            // for edge events
            subscription1 = subscribe('scrollStart', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scrollStart');
                subscription1.unsubscribe();
            });
            subscription2 = subscribe('scrollStart', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('scrollStart');
                subscription2.unsubscribe();
            });

            expect(ee.listeners('scroll').length).equal(1);
            // simulate window scroll event
            ee.emit('scroll', {foo: 'foo'});

            // for viewportchange event
            subscription1 = subscribe('viewportchange', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('viewportchange');
                subscription1.unsubscribe();
            });
            subscription2 = subscribe('viewportchange', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                expect(syntheticEvent.type).equal('viewportchange');
                subscription2.unsubscribe();
                done();
            });

            expect(ee.listeners('scroll').length).equal(1);
            expect(ee.listeners('resize').length).equal(1);
            expect(ee.listeners('visibilitychange').length).equal(1);
            // simulate window scroll event
            ee.emit('visibilitychange', {foo: 'foo'});
        });

        it('should not have fatal error if multiple unsubscibe happens', function (done) {
            var subscription = subscribe('scroll', function (e, syntheticEvent) {
                expect(e.foo).equal('foo');
                subscription.unsubscribe();
                subscription.unsubscribe();
                done();
            });
            ee.emit('scroll', {foo: 'foo'});
        });
    });
});
