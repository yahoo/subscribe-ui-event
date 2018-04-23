/* global window, document */
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import series from 'async/series';

import leIE8 from '../../src/lib/leIE8';

import SubscribeDemo from './subscribe-functional';

window.expect = expect;
window.leIE8 = leIE8;
window.series = series;

const container = document.getElementById('container');
ReactDOM.render(React.createElement(SubscribeDemo, null), container);
