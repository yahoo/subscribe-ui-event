/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

import { expect } from 'chai';

const env = require('../lib/setup');

const globalVars = require('../../../dist/globalVars');

const ee = globalVars.EE;

const subscribe = require('../../../dist/subscribe');

describe('subscribe', () => {
  describe('#general', () => {
    it('same main event should be subscribed once', (done) => {
      // for continuous events
      let subscription1 = subscribe('scroll', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scroll');
        subscription1.unsubscribe();
      });
      let subscription2 = subscribe('scroll', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scroll');
        subscription2.unsubscribe();
      });

      // 'scroll' event. The number of listeners will stay at 1 if the same event
      // is subscribed multiple times.
      expect(ee.listeners('scroll:50').length).to.equal(2);
      expect(globalVars.listeners['scroll:50']).to.be.ok;
      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });

      // remove scroll:50 listeners after unsubscibing
      expect(globalVars.listeners['scroll:50']).to.equal(undefined);

      // for edge events
      subscription1 = subscribe('scrollStart', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scrollStart');
        subscription1.unsubscribe();
      });
      subscription2 = subscribe('scrollStart', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scrollStart');
        subscription2.unsubscribe();
      });

      expect(ee.listeners('scrollStart:50').length).to.equal(2);
      expect(globalVars.listeners['scroll:50']).to.be.ok;
      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });

      // remove scroll:50 listeners after unsubscibing
      expect(globalVars.listeners['scroll:50']).to.equal(undefined);

      // for visibilitychange event
      subscription1 = subscribe('visibilitychange', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('visibilitychange');
        subscription1.unsubscribe();
      });
      subscription2 = subscribe('visibilitychange', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('visibilitychange');
        subscription2.unsubscribe();
        done();
      });

      expect(ee.listeners('visibilitychange:0').length).to.equal(2);
      expect(globalVars.listeners['visibilitychange:0']).to.be.ok;
      // simulate window scroll event
      env.eventHandlers.visibilitychange({ foo: 'foo' });
    });

    it('should not have fatal error if multiple unsubscibe happens', (done) => {
      const subscription = subscribe('scroll', (e) => {
        expect(e.foo).to.equal('foo');
        subscription.unsubscribe();
        subscription.unsubscribe();
        expect(globalVars.connections['scroll:50']).to.equal(0);
        done();
      });

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });

    it('should not fail if pass null arguments', () => {
      const subscription = subscribe('resize', null);
      subscription.unsubscribe();
    });
  });

  describe('#subscribe', () => {
    it('scroll should be triggered by window scroll', (done) => {
      const subscription = subscribe('scroll', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scroll');
        subscription.unsubscribe();
        done();
      });

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });

    it('scroll with throttle = 100 should be triggered by scroll:100 (scroll with 100ms throttle)', (done) => {
      const subscription = subscribe(
        'scroll',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('scroll');
          expect(subscription._type).to.equal('scroll:100');
          subscription.unsubscribe();
          done();
        },
        { throttleRate: 100 }
      );

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });

    it('scroll with rAF throttle should be triggered by window scroll', (done) => {
      const subscription = subscribe(
        'scroll',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('scroll');
          expect(subscription._type).to.equal('scroll:raf');
          subscription.unsubscribe();
          done();
        },
        { useRAF: true }
      );

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });

    it('scroll with 50ms rAF throttle should be triggered by scroll:raf', (done) => {
      const subscription = subscribe(
        'scroll',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('scroll');
          expect(subscription._type).to.equal('scroll:raf');
          subscription.unsubscribe();
          done();
        },
        { throttleRate: 50, useRAF: true }
      );

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });

    it('scrollStart and scrollEnd should be triggered by the start/end of window scroll', (done) => {
      const subscription1 = subscribe('scrollStart', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scrollStart');
        subscription1.unsubscribe();
      });
      const subscription2 = subscribe('scrollEnd', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('scrollEnd');
        subscription2.unsubscribe();
        done();
      });

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });

    it('scroll should be triggered by window scroll with scroll information', (done) => {
      // the first one subscription should get scroll info as well, because the second one requests
      const subscription1 = subscribe(
        'scroll',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('scroll');
          expect(ae.scroll.top).to.equal(10);
          subscription1.unsubscribe();
        },
        { enableScrollInfo: false }
      );

      // the second one request scroll info, which should dominate.
      const subscription2 = subscribe(
        'scroll',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('scroll');
          expect(ae.scroll.top).to.equal(10);
          subscription2.unsubscribe();
          done();
        },
        { enableScrollInfo: true }
      );

      // simulate window scroll event
      env.eventHandlers.scroll({ foo: 'foo' });
    });
  });

  describe('#resize', () => {
    it('resize should be triggered by window resize with resize information', (done) => {
      // the first one subscription should get resize info as well, because the second one requests
      const subscription1 = subscribe(
        'resize',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('resize');
          expect(ae.resize.width).to.equal(20);
          subscription1.unsubscribe();
        },
        { enableResizeInfo: false }
      );

      const subscription2 = subscribe(
        'resize',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('resize');
          expect(ae.resize.width).to.equal(20);
          subscription2.unsubscribe();
          done();
        },
        { enableResizeInfo: true }
      );

      // simulate window scroll event
      env.eventHandlers.resize({ foo: 'foo' });
    });

    it('resizeStart and resizeEnd should be triggered by the start/end of window resize', (done) => {
      let numCalls = 0;
      const subscription1 = subscribe('resizeStart', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('resizeStart');
        subscription1.unsubscribe();
        numCalls++;
      });
      const subscription2 = subscribe('resizeEnd', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('resizeEnd');
        subscription2.unsubscribe();
        numCalls++;
        expect(numCalls).to.equal(2);
        done();
      });

      // simulate window scroll event
      env.eventHandlers.resize({ foo: 'foo' });
    });
  });

  describe('#visibilitychange', () => {
    it('visibilitychange should be triggered by visibilitychange:0', (done) => {
      // no throttling for discrete event
      const subscription = subscribe('visibilitychange', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('visibilitychange');
        expect(subscription._type).to.equal('visibilitychange:0');
        subscription.unsubscribe();
        done();
      });

      env.eventHandlers.visibilitychange({ foo: 'foo' });
    });
  });

  describe('#touch', () => {
    it('touchmove, touchmoveStart, touchmoveEnd should be triggered by body touchmove', (done) => {
      let numCalls = 0;
      const subscription1 = subscribe('touchmoveStart', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchmoveStart');
        subscription1.unsubscribe();
        numCalls++;
      });
      const subscription2 = subscribe('touchmove', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchmove');
        subscription2.unsubscribe();
        numCalls++;
      });
      const subscription3 = subscribe('touchmoveEnd', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchmoveEnd');
        subscription3.unsubscribe();
        numCalls++;
        expect(numCalls).to.equal(3);
        done();
      });

      env.eventHandlers.touchmove({ foo: 'foo' });
    });

    it('touchstart should be triggered by body touchstart', (done) => {
      const subscription = subscribe('touchstart', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchstart');
        subscription.unsubscribe();
        done();
      });

      env.eventHandlers.touchstart({ foo: 'foo' });
    });

    it('touchend should be triggered by body touchend', (done) => {
      const subscription = subscribe('touchend', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchend');
        subscription.unsubscribe();
        done();
      });

      env.eventHandlers.touchend({ foo: 'foo' });
    });

    it('touch should be triggered with touch information', (done) => {
      const touch = {
        pageX: 20,
        pageY: 20
      };
      const subscription1 = subscribe(
        'touchmoveStart',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('touchmoveStart');
          expect(ae.touch.startX).to.equal(20);
          expect(ae.touch.startY).to.equal(20);
          subscription1.unsubscribe();
          touch.pageX = 30;
          touch.pageY = 20;
        },
        { enableTouchInfo: true }
      );

      const subscription2 = subscribe('touchmove', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchmove');
        expect(ae.touch.startX).to.equal(20);
        expect(ae.touch.startY).to.equal(20);
        expect(ae.touch.deltaX).to.equal(10);
        expect(ae.touch.deltaY).to.equal(0);
        expect(ae.touch.axisIntention).to.equal('x');
        subscription2.unsubscribe();
        done();
      });

      // simulate window scroll event
      env.eventHandlers.touchmove({
        foo: 'foo',
        touches: [touch]
      });
    });

    it('touch should be triggered with touch information (without pageX, pageY)', (done) => {
      const touch = {
        clientX: 20,
        clientY: 20
      };
      const subscription1 = subscribe(
        'touchmoveStart',
        (e, ae) => {
          expect(e.foo).to.equal('foo');
          expect(ae.type).to.equal('touchmoveStart');
          expect(ae.touch.startX).to.equal(20);
          expect(ae.touch.startY).to.equal(30);
          subscription1.unsubscribe();
          touch.clientX = 20;
          touch.clientY = 30;
        },
        { enableTouchInfo: true }
      );

      const subscription2 = subscribe('touchmove', (e, ae) => {
        expect(e.foo).to.equal('foo');
        expect(ae.type).to.equal('touchmove');
        expect(ae.touch.startX).to.equal(20);
        expect(ae.touch.startY).to.equal(30);
        expect(ae.touch.deltaX).to.equal(0);
        expect(ae.touch.deltaY).to.equal(10);
        expect(ae.touch.axisIntention).to.equal('y');
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
