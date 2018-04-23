/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */

import globalVars from './globalVars';

let resize = { // eslint-disable-line prefer-const
  width: 0,
  height: 0
};
let scroll = { // eslint-disable-line prefer-const
  delta: 0,
  top: 0
};
let touch = { // eslint-disable-line prefer-const
  axisIntention: '',
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0
};

const INTENTION_THRESHOLD = 5;

const getXY = (pos) => {
  let t = { x: 0, y: 0 }; // eslint-disable-line prefer-const
  const docBody = document.body;
  const docEl = document.documentElement;

  if (pos.pageX || pos.pageY) {
    t.x = pos.pageX;
    t.y = pos.pageY;
  } else {
    t.x = pos.clientX + docBody.scrollLeft + docEl.scrollLeft;
    t.y = pos.clientY + docBody.scrollTop + docEl.scrollTop;
  }

  return t;
};

/**
 * ArgmentedEvent will hold some global information, such like window scroll postion,
 * so that those information is only calculated once.
 * @param {Object} option - The option for SyntheticEvent
 */
class AugmentedEvent {
  constructor(option = {}) {
    const mainType = (option.mainType || '').toLowerCase();
    const subType = (option.subType || '').toLowerCase();

    this.mainType = mainType;
    this.subType = subType;
    this.type =
      mainType + subType.charAt(0).toUpperCase() + subType.slice(1) || '';
    this.scroll = scroll;
    this.resize = resize;
    this.touch = touch;
  }

  update(e) {
    const { mainType, subType } = this;
    const docEl = document.documentElement;

    if (
      globalVars.enableScrollInfo &&
      (mainType === 'scroll' || mainType === 'touchmove')
    ) {
      const top = docEl.scrollTop + document.body.scrollTop;
      // Prevent delta from being 0
      if (top !== this.scroll.top) {
        this.scroll.delta = top - this.scroll.top;
        this.scroll.top = top;
      }
    }
    if (globalVars.enableResizeInfo && mainType === 'resize') {
      this.resize.width = window.innerWidth || docEl.clientWidth;
      this.resize.height = window.innerHeight || docEl.clientHeight;
    }
    if (
      globalVars.enableTouchInfo &&
      e.touches &&
      (mainType === 'touchstart' ||
        mainType === 'touchmove' ||
        mainType === 'touchend')
    ) {
      let pos;
      let absX;
      let absY;
      if (mainType === 'touchstart' || subType === 'start') {
        pos = getXY(e.touches[0]);
        this.touch.axisIntention = '';
        this.touch.startX = pos.x;
        this.touch.startY = pos.y;
        this.touch.deltaX = 0;
        this.touch.deltaY = 0;
      } else if (mainType === 'touchmove') {
        pos = getXY(e.touches[0]);
        this.touch.deltaX = pos.x - this.touch.startX;
        this.touch.deltaY = pos.y - this.touch.startY;
        if (this.touch.axisIntention === '') {
          absX = Math.abs(this.touch.deltaX);
          absY = Math.abs(this.touch.deltaY);
          if (absX > INTENTION_THRESHOLD && absX >= absY) {
            this.touch.axisIntention = 'x';
          } else if (absY > INTENTION_THRESHOLD && absY > absX) {
            this.touch.axisIntention = 'y';
          }
        }
      }
    }
  }
}
export default AugmentedEvent;
