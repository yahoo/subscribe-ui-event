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
var subscribe = require('../../../src/subscribe');

describe('subscribe', function () {
    describe('#general', function () {
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

        it('should not fail if pass null arguments', function () {
            var subscription = subscribe('resize', null);
            subscription.unsubscribe();
        });
    });

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
    });

    describe('#resize', function () {
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

        it('resizeStart and resizeEnd should be triggered by the start/end of window resize', function (done) {
            var numCalls = 0;
            var subscription1 = subscribe('resizeStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('resizeStart');
                subscription1.unsubscribe();
                numCalls++;
            });
            var subscription2 = subscribe('resizeEnd', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('resizeEnd');
                subscription2.unsubscribe();
                numCalls++;
                expect(numCalls).equal(2);
                done();
            });

            // simulate window scroll event
            env.eventHandlers.resize({foo: 'foo'});
        });
    });

    describe('#visibilitychange', function () {
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
    });

    describe('#touch', function () {
        it('touchmove, touchmoveStart, touchmoveEnd should be triggered by body touchmove', function (done) {
            var numCalls = 0;
            var subscription1 = subscribe('touchmoveStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmoveStart');
                subscription1.unsubscribe();
                numCalls++;
            });
            var subscription2 = subscribe('touchmove', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmove');
                subscription2.unsubscribe();
                numCalls++;
            });
            var subscription3 = subscribe('touchmoveEnd', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmoveEnd');
                subscription3.unsubscribe();
                numCalls++;
                expect(numCalls).equal(3);
                done();
            });

            env.eventHandlers.touchmove({foo: 'foo'});
        });

        it('touchstart should be triggered by body touchstart', function (done) {
            var subscription = subscribe('touchstart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchstart');
                subscription.unsubscribe();
                done();
            });

            env.eventHandlers.touchstart({foo: 'foo'});
        });

        it('touchend should be triggered by body touchend', function (done) {
            var subscription = subscribe('touchend', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchend');
                subscription.unsubscribe();
                done();
            });

            env.eventHandlers.touchend({foo: 'foo'});
        });

        it('touch should be triggered with touch information', function (done) {
            var touch = {
                pageX: 20,
                pageY: 20
            };
            var subscription1 = subscribe('touchmoveStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmoveStart');
                expect(ae.touch.startX).equal(20);
                expect(ae.touch.startY).equal(20);
                subscription1.unsubscribe();
                touch.pageX = 30;
                touch.pageY = 20;
            }, {enableTouchInfo: true});

            var subscription2 = subscribe('touchmove', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmove');
                expect(ae.touch.startX).equal(20);
                expect(ae.touch.startY).equal(20);
                expect(ae.touch.deltaX).equal(10);
                expect(ae.touch.deltaY).equal(0);
                expect(ae.touch.axisIntention).equal('x');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.touchmove({
                foo: 'foo',
                touches: [touch]
            });
        });

        it('touch should be triggered with touch information (without pageX, pageY)', function (done) {
            var touch = {
                clientX: 20,
                clientY: 20
            };
            var subscription1 = subscribe('touchmoveStart', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmoveStart');
                expect(ae.touch.startX).equal(20);
                expect(ae.touch.startY).equal(30);
                subscription1.unsubscribe();
                touch.clientX = 20;
                touch.clientY = 30;
            }, {enableTouchInfo: true});

            var subscription2 = subscribe('touchmove', function (e, ae) {
                expect(e.foo).equal('foo');
                expect(ae.type).equal('touchmove');
                expect(ae.touch.startX).equal(20);
                expect(ae.touch.startY).equal(30);
                expect(ae.touch.deltaX).equal(0);
                expect(ae.touch.deltaY).equal(10);
                expect(ae.touch.axisIntention).equal('y');
                subscription2.unsubscribe();
                done();
            });

            // simulate window scroll event
            env.eventHandlers.touchmove({
                foo: 'foo',
                touches: [touch]
            });
        });
    });
});
