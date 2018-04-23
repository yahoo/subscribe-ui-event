/* global window, document */
import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom'; // eslint-disable-line
import { expect } from 'chai'; // eslint-disable-line
import series from 'async/series'; // eslint-disable-line

import leIE8 from '../../src/lib/leIE8'; // eslint-disable-line

import SubscribeDemo from './subscribe-functional'; // eslint-disable-line

window.expect = expect;
window.leIE8 = leIE8;
window.series = series;

const container = document.getElementById('container');
ReactDOM.render(React.createElement(SubscribeDemo, null), container);
