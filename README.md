# subscribe-ui-event
[![npm version](https://badge.fury.io/js/subscribe-ui-event.svg)](http://badge.fury.io/js/subscribe-ui-event)
[![Build Status](https://travis-ci.org/yahoo/subscribe-ui-event.svg?branch=master)](https://travis-ci.org/yahoo/subscribe-ui-event)
[![Coverage Status](https://coveralls.io/repos/yahoo/subscribe-ui-event/badge.svg)](https://coveralls.io/r/yahoo/subscribe-ui-event)
[![Dependency Status](https://david-dm.org/yahoo/subscribe-ui-event.svg)](https://david-dm.org/yahoo/subscribe-ui-event)
[![devDependency Status](https://david-dm.org/yahoo/subscribe-ui-event/dev-status.svg)](https://david-dm.org/yahoo/subscribe-ui-event#info=devDependencies)

`subscribe-ui-event` provides an cross-browser and performant way to subscribe to browser UI Events and some higher level events.

Instead of calling `window.addEvenListener('scroll', eventHandler);`, you can call `subscribe('scroll', eventHandler)`, and it will help you hook `eventHandler` to `window.scroll` only once for multiple subscriptions.

The benefit is some global variables, such like `document.body.scrollTop`, can be retrieved only once for all subscriptions, which is better for performance. Throttling for all subscriptions is another benefit, which also can increase the performance.

**The list of benefits:**

1. Do throttling by default.
2. Provide `requestAnimationFrame` throttle for the need of high performance.
3. Attach to UI event only once for multiple subscriptions, and broadcast via [eventemitter3](https://github.com/primus/EventEmitter3),
4. Provide single access to UI variables (such like `scrollTop`) to avoid multiple reflows.

## Install

```bash
ynpm install subscribe-ui-event
```

## API

### subscribe

```js
Subscription subscribe(String eventType, Function callback, Object? options)
```

Provide throttled version of window or document events, such like `scroll`, `resize` and `visibilitychange` to subscribe. It also provides some higher, compound events, such like `viewportchange`, which combines `scroll`, `resize` and `visibilitychange` events.

**Note on IE8 or the below, the throttle will be turned off because the event object is global and will be deleted for setTimeout or rAF.**

Example:

```js
var subscribe = require('subscribe-ui-event').subscribe;
function eventHandler (e, payload) {
    // e is the native event object and
    // payload is the additional information
    ...
}
// 50ms throttle by default
var subscription = subscribe('scroll', eventHandler);
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
    }
}
```

**Options**

`options.throttleRate` allows of changing the throttle rate, and the default value is 50 (ms). Set 0 for no throttle. **On IE8, there will be no throttle, because throttling will use setTimeout or rAF to achieve, and the event object passed into event handler will be overwritten.**

`options.context` allows of setting the caller of callback function.

`options.useRAF = true` allows of using `requestAnimationFrame` instead of `setTimeout`.

`options.enableScrollInfo = true` allows of getting `scrollTop`.

`options.enableResizeInfo = true` allows of getting `width` and `height` of client.

`eventType` could be one of the following:

1. scroll - window.scoll
2. scrollStart - The start window.scoll
3. scrollEnd - The end window.scoll
4. resize - window.resize
5. resizeStart - The start window.resize
6. resizeEnd - The end window.resize
7. visibilitychange - document.visibilitychange
8. viewportchange - scroll + resize + visibilitychange

### unsubscribe

```js
Void unsubscribe(String eventType, Function callback)
```

Unsubscribe an event. **Note that all subscriptions with the same eventHandler and the same event type will be unsubscribed together even if they have different options**.

## License

This software is free to use under the BSD license.
See the [LICENSE file](./LICENSE.md) for license text and copyright information.
