# subscribe-ui-event

[![npm version](https://badge.fury.io/js/subscribe-ui-event.svg)](http://badge.fury.io/js/subscribe-ui-event)
[![Build Status](https://travis-ci.org/yahoo/subscribe-ui-event.svg?branch=master)](https://travis-ci.org/yahoo/subscribe-ui-event)
[![Coverage Status](https://coveralls.io/repos/yahoo/subscribe-ui-event/badge.svg)](https://coveralls.io/r/yahoo/subscribe-ui-event)
[![Dependency Status](https://david-dm.org/yahoo/subscribe-ui-event.svg)](https://david-dm.org/yahoo/subscribe-ui-event)
[![devDependency Status](https://david-dm.org/yahoo/subscribe-ui-event/dev-status.svg)](https://david-dm.org/yahoo/subscribe-ui-event#info=devDependencies)

With `subscribe-ui-event`, instead of calling multiple `window.addEventListener('scroll', eventHandler);` by different components, call `subscribe('scroll', eventHandler)`. It will only add single event listener and dispatch event to those who subscribe the event via [eventemitter3](https://github.com/primus/EventEmitter3).

Why single event? More performance and less memory consumption.

## Single Event Listener v.s. Multiple Event Listeners

The [jsperf ](http://jsperf.com/subscribe-v-s-addeventlistener/2) runs 10 `addEventListener` and 10 non-throttling `subscribe`, and the outcome is that the ops/sec of `subscribe` is slightly less. But in regular case, you will use throttling `subscribe`, and it will be more performant.

![comparison](https://cloud.githubusercontent.com/assets/2044960/9611594/6167df1c-5095-11e5-8abc-c81ff4d13ce6.png)

For 10 `addEventListener`, the difference of memory consumption between peak and trough is about 4.1K.

![addEventListener](https://cloud.githubusercontent.com/assets/2044960/9611614/778bc452-5095-11e5-80d9-be9379df9956.png)

For 10 `subscribe`, the difference of memory consumption between peak and trough is about 1.0K.

![subscribe](https://cloud.githubusercontent.com/assets/2044960/9611619/7c293652-5095-11e5-8d27-29a0d2d167cc.png)

## Other Benifits

1.  Do throttling by default.
2.  Get `document.body.scrollTop`, `window.innerWidth` once.
3.  Provide `requestAnimationFrame` throttle for the need of high performance.
4.  Be able to use like `scrollStart` (see below) those edge events.

## Install

```bash
npm install subscribe-ui-event
```

## API

### subscribe

```js
Subscription subscribe(String eventType, Function callback, Object? options)
```

Provide throttled version of window or document events, such like `scroll`, `resize`, `touch` and `visibilitychange` to subscribe, see below.

**Note on IE8 or the below, the throttle will be turned off because the event object is global and will be deleted for setTimeout or rAF.**

Example:

```js
import { subscribe } from 'subscribe-ui-event');
function eventHandler (e, payload) {
    // e is the native event object and
    // payload is the additional information
    ...
}
// 50ms throttle by default
const subscription = subscribe('scroll', eventHandler);
// remove later
subscription.unsubscribe();
```

**Addtional Payload**

The format of the payload is:

```js
{
    type: <String>, // could be 'scroll', 'resize' ...
    // you need to pass options.enableScrollInfo = true to subscribe to get the following data
    scroll: {
        top: <Number>, // The scroll position, i.g., document.body.scrollTop
        delta: <Number> // The delta of scroll position, it is helpful for scroll direction
    },
    // you need to pass options.enableResizeInfo = true to subscribe to get the following data
    resize: {
        width: <Number>, // The client width
        height: <Number> // The client height
    },
    // you need to pass options.enableTouchInfo = true to subscribe to get the following data
    touch: {
        axisIntention: <String>, // 'x', 'y', or ''.
        startX: <Number>,
        startY: <Number>,
        deltaX: <Number>,
        deltaY: <Number>
    }
}
```

**Options**

`options.throttleRate` allows of changing the throttle rate, and the default value is 50 (ms). Set 0 for no throttle. **On IE8, there will be no throttle, because throttling will use setTimeout or rAF to achieve, and the event object passed into event handler will be overwritten.**

`options.context` allows of setting the caller of callback function.

`options.useRAF = true` allows of using `requestAnimationFrame` instead of `setTimeout`.

`options.enableScrollInfo = true` allows of getting `scrollTop`.

`options.enableResizeInfo = true` allows of getting `width` and `height` of client.

`options.enableTouchInfo = true` allows of getting touch information (see above).

`eventType` could be one of the following:

1.  scroll - window.scoll
2.  scrollStart - The start of window.scoll
3.  scrollEnd - The end of window.scoll
4.  resize - window.resize
5.  resizeStart - The start window.resize
6.  resizeEnd - The end window.resize
7.  visibilitychange - document.visibilitychange (IE8 doesn't support)
8.  touchmoveStart - The start of window.touchmove
9.  touchmoveEnd - The end of window.touchmove
10. touchmove - window.touchmove
11. touchstart - window.touchstart
12. touchend - window.touchend

`options.eventOptions`: An options object that specifies characteristics about the event listener (if passive event is supported by the browser)

### unsubscribe

```js
Void unsubscribe(String eventType, Function callback)
```

Unsubscribe an event listener, suggest to use `subscription.unsubscribe()`, because it may accidentally unsubscribe those events having the same `eventType` and `callback` but different `throttleRate`.

## Credits

* This library runs full browser test suite using Sauce Labs.

## License

This software is free to use under the BSD license.
See the [LICENSE file](./LICENSE.md) for license text and copyright information.
