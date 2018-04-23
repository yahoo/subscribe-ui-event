/* global window, document */
import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import async from 'async';

import leIE8 from '../../src/lib/leIE8';

import SubscribeDemo from './subscribe-functional';

window.expect = expect;
window.leIE8 = leIE8;
window.async = async;

const container = document.getElementById('container');
ReactDOM.render(React.createElement(SubscribeDemo, null), container);
