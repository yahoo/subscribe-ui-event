/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */

import { expect } from 'chai';

const globalVars = require('../../../dist/globalVars');

const subscribe = require('../../../dist/subscribe');
const unsubscribe = require('../../../dist/unsubscribe');

describe('unsubscribe', () => {
  it('scroll should be triggered by window scroll', () => {
    const fn = function () {};
    subscribe('scroll', fn);
    unsubscribe('scroll', fn);
    expect(globalVars.removers.length).to.equal(0);
  });
});
