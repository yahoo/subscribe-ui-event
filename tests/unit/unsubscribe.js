/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before */

'use strict';

var ee = require('../../../src/eventEmitter').eventEmitter;

GLOBAL.window = {
    addEventListener: function (eventType, cb) {
        ee.on(eventType, cb);
    },
    removeEventListener: function (eventType, cb) {
        ee.removeListener(eventType, cb);
    },
    setTimeout: function (cb, wait) {
        cb();
    }
};
GLOBAL.document = {
    addEventListener: function (eventType, cb) {
        ee.on(eventType, cb);
    },
    removeEventListener: function (eventType, cb) {
        ee.removeListener(eventType, cb);
    }
};

var expect = require('expect.js');
var subscribe = require('../../../src/subscribe');
var subscriptions = require('../../../src/eventEmitter').subscriptions;
var unsubscribe = require('../../../src/unsubscribe');

describe('unsubscribe', function () {
    before(function () {
        // unsubscribe all subscriptions, subscriptions may come from other tests
        for (var i = subscriptions.length - 1; i >= 0; i--) {
            subscriptions[i].unsubscribe();
        }
    });

    describe('#unsubscribe', function () {
        it('should unsubscribe the event', function () {
            function eventHandler() {
                // empty function
            }

            // make sure no subscriptions at beginning
            expect(subscriptions.length).to.equal(0);

            // it works that the same eventHandler subscribes to the same eventType but with different options,
            // but it doesn't make sense. So when unsubscribing, those 2 will be unsubscribe together.
            subscribe('scroll', eventHandler);
            subscribe('scroll', eventHandler, {throttleRate: 300});
            expect(subscriptions.length).to.equal(2);
            expect(ee.listeners('scroll:50', true)).to.be.true;
            expect(ee.listeners('scroll:300', true)).to.be.true;

            // will remove all instances with the same eventType and eventHandler
            unsubscribe('scroll', eventHandler);
            expect(subscriptions.length).to.equal(0);
            expect(ee.listeners('scroll:50', true)).to.be.false;
        });
    });
});
