# subscribe-ui-event

[![Build Status](https://travis-ci.org/yahoo/subscribe-ui-event.svg?branch=master)](https://travis-ci.org/yahoo/subscribe-ui-event)
[![Coverage Status](https://coveralls.io/repos/yahoo/subscribe-ui-event/badge.svg)](https://coveralls.io/r/yahoo/subscribe-ui-event)

`subscribe-ui-event` provides an cross-browser and performant way to subscribe to browser UI Events.

Instead of calling `window.addEvenListener('scroll', eventHandler);`, you can call `subscribe('scroll', eventHandler)` and you can get lots of benifits:

1. Do throttling by default.
2. Provide `requestAnimationFrame` throttle for the need of high performance.
3. Attach to UI event only once for multiple subscriptions, and broadcast via [eventemitter3](https://github.com/primus/EventEmitter3),
4. (In the near future) Provide single access to UI variables (such like `scrollTop`) to avoid multiple reflows.

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

`options.throttleRate` allows of changing the throttle rate, and the default value is 50 (ms). Set 0 for no throttle. **On IE8, there will be no throttle, because throttling will use setTimeout or rAF to achieve, and the event object passed into event handler will be overwritten.**

`options.context` allows of setting the caller of callback function.

`options.useRAF = true` allows of using `requestAnimationFrame` instead of `setTimeout`. If `true`, the default value of throttle rate will be 15 (ms).

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
