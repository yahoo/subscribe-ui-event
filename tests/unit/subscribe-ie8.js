/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global  window,document, navigator, describe, it, before, beforeEach, after */

import { expect } from 'chai';

const env = require('../lib/setup');

let subscribe;

describe('subscribe-ie8', () => {
  before(() => {
    // navigator.userAgent = 'MSIE 1.0';
    Object.defineProperty(navigator, 'userAgent', {
      get() {
        return 'MSIE 1.0';
      },
      configurable: true
    });
    window.addEventListener = null;
    window.removeEventListener = null;
    document.addEventListener = null;
    document.removeEventListener = null;
    require.cache[require.resolve('../../../dist/lib/leIE8')] = undefined;
    require.cache[require.resolve('../../../dist/subscribe')] = undefined;
    require.cache[require.resolve('../../../dist/mainEventConnectors')] = undefined;
  });

  after(() => {
    Object.defineProperty(navigator, 'userAgent', {
      get() {
        return '';
      },
      configurable: true
    });
    window.addEventListener = window.attachEvent;
    window.removeEventListener = window.detachEvent;
    document.addEventListener = document.attachEvent;
    document.removeEventListener = document.detachEvent;
  });

  beforeEach(() => {
    subscribe = require('../../../dist/subscribe'); // eslint-disable-line
  });

  describe('#subscribe', () => {
    it('scroll should be triggered by window scroll without throttling', (done) => {
      const subscription = subscribe('scroll', (e, syntheticEvent) => {
        expect(e.foo).to.equal('foo');
        expect(syntheticEvent.type).to.equal('scroll');
        expect(subscription._type).to.equal('scroll:0');
        subscription.unsubscribe();
        done();
      });

      // simulate window scroll event
      env.eventHandlers.onscroll({ foo: 'foo' });
    });

    it('scrollStart and scrollEnd should be triggered by the start/end without throttling', (done) => {
      const subscription1 = subscribe('scrollStart', (e, syntheticEvent) => {
        expect(e.foo).to.equal('foo');
        expect(syntheticEvent.type).to.equal('scrollStart');
        expect(subscription1._type).to.equal('scrollStart:0');
        subscription1.unsubscribe();
      });

      const subscription2 = subscribe('scrollEnd', (e, syntheticEvent) => {
        expect(e.foo).to.equal('foo');
        expect(syntheticEvent.type).to.equal('scrollEnd');
        expect(subscription2._type).to.equal('scrollEnd:0');
        subscription2.unsubscribe();
        done();
      });

      // simulate window scroll event
      env.eventHandlers.onscroll({ foo: 'foo' });
    });
  });
});
