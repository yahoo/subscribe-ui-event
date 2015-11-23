/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

'use strict';

var env = require('../lib/setup');

var globalVars = require('../../../src/globalVars');
var ee = require('../../../src/globalVars').EE;

var expect = require('expect.js');
var subscribe = require('../../../src/_subscribe');

describe('subscribe', function () {
    describe('#subscribe', function () {
        it('scroll should be triggered by window scroll', function (done) {
            var subscription = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                subscription.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });

        it('scroll with throttle = 100 should be triggered by scroll:100 (scroll with 100ms throttle)', function (done) {
            var subscription = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                expect(subscription._type).equal('scroll:100');
                subscription.unsubscribe();
                done();
            }, {throttleRate: 100});

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });

        it('scroll with rAF throttle should be triggered by window scroll', function (done) {
            var subscription = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                expect(subscription._type).equal('scroll:raf');
                subscription.unsubscribe();
                done();
            }, {useRAF: true});

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });

        it('scroll with 50ms rAF throttle should be triggered by scroll:raf', function (done) {
            var subscription = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                expect(subscription._type).equal('scroll:raf');
                subscription.unsubscribe();
                done();
            }, {throttleRate: 50, useRAF: true});

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });

        // it('viewportchange should be triggered by scroll, resize, and visibilitychange', function (done) {
        //     var fireCount = 0;
        //     var subscription = subscribe('viewportchange', function (e, ae) {
        //         expect(e.foo).equal('foo');
        //         expect(ae.type).equal('viewportchange');
        //         fireCount++;
        //         if (fireCount === 3) {
        //             subscription.unsubscribe();
        //             done();
        //         }
        //     });
        //
        //     ee.emit('scroll', {foo: 'foo'});
        //     ee.emit('resize', {foo: 'foo'});
        //     ee.emit('visibilitychange', {foo: 'foo'});
        // });
        //
        // it('viewportchange should be triggered by viewportchange:50', function (done) {
        //     var subscription = subscribe('viewportchange', function (e, ae) {
        //         expect(e.foo).equal('foo');
        //         expect(ae.bar).equal('bar');
        //         subscription.unsubscribe();
        //         done();
        //     });
        //
        //     ee.emit('viewportchange:50', {foo: 'foo'}, {bar: 'bar'});
        // });

        it('visibilitychange should be triggered by visibilitychange:0', function (done) {
            // no throttling for discrete event
            var subscription = subscribe('visibilitychange', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('visibilitychange');
                expect(subscription._type).equal('visibilitychange:0');
                subscription.unsubscribe();
                done();
            });

            env.eventHandlers.visibilitychange({foo: 'foo'});
        });

        it('should not fail if pass null arguments', function () {
            var subscription = subscribe('resize', null);
            subscription.unsubscribe();
        });

        it('scrollStart and scrollEnd should be triggered by the start/end of window scroll', function (done) {
            var subscription1 = subscribe('scrollStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scrollStart');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('scrollEnd', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scrollEnd');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });

        it('resizeStart and resizeEnd should be triggered by the start/end of window resize', function (done) {
            var subscription1 = subscribe('resizeStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('resizeStart');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('resizeEnd', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('resizeEnd');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.resize({foo: 'foo'});
        });

        it('scroll should be triggered by window scroll with scroll information', function (done) {
            // the first one subscription should get scroll info as well, because the second one requests
            var subscription1 = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                expect(ae.scroll.top).equal(10);
                subscription1.unsubscribe();
            }, {enableScrollInfo: false});

            // the second one request scroll info, which should dominate.
            var subscription2 = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                expect(ae.scroll.top).equal(10);
                subscription2.unsubscribe();
                done();
            }, {enableScrollInfo: true});

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });

        it('resize should be triggered by window resize with resize information', function (done) {
            // the first one subscription should get resize info as well, because the second one requests
            var subscription1 = subscribe('resize', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('resize');
                expect(ae.resize.width).equal(20);
                subscription1.unsubscribe();
            }, {enableResizeInfo: false});

            var subscription2 = subscribe('resize', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('resize');
                expect(ae.resize.width).equal(20);
                subscription2.unsubscribe();
                done();
            }, {enableResizeInfo: true});

            // simulate window scroll event
            env.eventHandlers.resize({foo: 'foo'});
        });

        it('same main event should be subscribed once', function (done) {
            // for continuous events
            var subscription1 = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                subscription1.unsubscribe();
            });
            var subscription2 = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scroll');
                subscription2.unsubscribe();
            });

            // 'scroll' event. The number of listeners will stay at 1 if the same event is subscribed multiple times.
            expect(ee.listeners('scroll:50').length).equal(2);
            expect(globalVars.listeners['scroll:50']).to.be.ok();
            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});

            // remove scroll:50 listeners after unsubscibing
            expect(globalVars.listeners['scroll:50']).equal(undefined);

            // for edge events
            subscription1 = subscribe('scrollStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scrollStart');
                subscription1.unsubscribe();
            });
            subscription2 = subscribe('scrollStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('scrollStart');
                subscription2.unsubscribe();
            });

            expect(ee.listeners('scrollStart:50').length).equal(2);
            expect(globalVars.listeners['scroll:50']).to.be.ok();
            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});

            // remove scroll:50 listeners after unsubscibing
            expect(globalVars.listeners['scroll:50']).equal(undefined);

            // for visibilitychange event
            subscription1 = subscribe('visibilitychange', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('visibilitychange');
                subscription1.unsubscribe();
            });
            subscription2 = subscribe('visibilitychange', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('visibilitychange');
                subscription2.unsubscribe();
                done();
            });

            expect(ee.listeners('visibilitychange:0').length).equal(2);
            expect(globalVars.listeners['visibilitychange:0']).to.be.ok();
            // simulate window scroll event
            env.eventHandlers.visibilitychange({foo: 'foo'});
        });

        it('should not have fatal error if multiple unsubscibe happens', function (done) {
            var subscription = subscribe('scroll', function (e, ae) {
                expect(e.foo).equal('foo');
                subscription.unsubscribe();
                subscription.unsubscribe();
                expect(globalVars.connections['scroll:50']).equal(0);
                done();
            });

            // simulate window scroll event
            env.eventHandlers.scroll({foo: 'foo'});
        });
    });
});
