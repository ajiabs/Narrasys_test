'use strict';

/*  QueuePointScheduler Service
  Manages the conceptual timeline for the episode by publishing key events
  to subscribers. A subscriber must provide a 'span' object which contains
  integer properties 'begin' and 'end'. The service keeps an internal record
  of span states. A span state is active when the playhead is within the begin-end
  range of the span and inactive when it is not. An 'enter' topic will be published
  when the playhead first enters an inactive span, and an 'exit' topic will be
  published when the playhead first exits an active span. The service needs to be
  configured with a timeline provider which keeps the service informed of the playhead
  position, thus synchronizing it with a media item's timeline.
*/
angular.module('com.inthetelling.player')
.factory('queuePointScheduler', function ($window) {
	var svc = {};

  // Event 'constants' (public)
  svc.ENTER = "enter";
  svc.EXIT = "exit";

  // A collection of spans that have been subscribed with this service
  var subscriptions = [];

  // A dictionary of existing subscription keys, used for speedy reference to 
  // check if a subscription exists inside the subscriptions collection
  var subscriptionKeys = {};

  // A unique string to identify the timeline provider
  var providerId;

  // Playhead Position
  var playhead;

  // Flag will be set to true whenever the playhead position changes
  var needScan = false;

  // Reference to the interval timer which kicks off scans
  var scanIntervalId;

  // Generate a key for the inSubscriptions dictionary
  var spanToKey = function(span) {
    return span.begin + '-' + span.end;
  };

  /*  Sets the playhead position. A reference to this function will be given to the registered
    timeline provider and they are expected to call it whenever the playhead position changes.
  */
  var setPlayhead = function(position) {
    console.log("setPlayhead("+position+")");
    playhead = position;
    needScan = true;
  };

  /*  Scans the current subscriptions dictionary against the current playhead position,
    and changes span states as needed. Fires the callback for the span whenever there
    is a state change.
    TODO: jsPerf to maximize the speed of the scan. Try things like defining subscriptions[i]
        outside of the loop, case vs. if, lazy truth vs equality checks, nested vs composite ifs,
        needScan condition, etc.
  */
  var scan = function() {
    if (needScan) {
      var i,
        len = subscriptions.length,
        span;
      for (i=0; i < len; i++) {
        span = subscriptions[i];
        // if the span is active
        if (span.isActive) {
          // and the playhead is outside of the span range
          if (playhead < span.begin || playhead >= span.end) {
            // deactivate the span
            span.isActive = false;
            // and 'publish' EXIT event
            span.callback.call(undefined, {begin: span.begin, end: span.end}, svc.EXIT, playhead);
            // TODO: this needs to be called from the object scope where callback was originally passed in
          }
        }
        // else if the span is inactive
        else if (!span.isActive) {
          // and the playhead is inside of the span range
          if (playhead >= span.begin && playhead < span.end) {
            // activate the span
            span.isActive = true;
            // and 'publish' ENTER event
            span.callback.call(undefined, {begin: span.begin, end: span.end}, svc.ENTER, playhead);
            // TODO: this needs to be called from the object scope where callback was originally passed in
          }
        }
      }
      needScan = false;
    }
  };

  /*  Allow consumer to subscribe to enter/exit events for the given span. Span should be
    an object with 'begin' and 'end' properties as positive integers. If the given span
    already exists the subscription will fail. Callback should be a function that accepts
    a span argument (returning the span object) and an event argument (returning the event string).
    For each span, the callback is fired with an ENTER event when an inactive span becomes active,
    and an EXIT event when an active span becomes inactive.
    Returns true if the subscription was successful and false if the subscription failed.
    TODO: Validate params
   */
  svc.subscribe = function(span, callback) {
    /* validate
    if (!span                       ||
      !callback                     ||
      toString.call(callback) != '[object Function]'  ||
      toString.call(span.begin) != '[object Number]'  ||
      toString.call(span.end) != '[object Number]'  ||
      subscriptionKeys[spanToKey(span)]       ){
      return false;
    }
    */

    subscriptionKeys[spanToKey(span)] = true;

    subscriptions.push({
      begin: span.begin,
      end: span.end,
      callback: callback,
      isActive: false
    });

    return true;
  };

  /*  Unsubscribe the given span. Unsubscribe will fail if the subscription does not exist.
    Returns true if the unsubscribe was successful and false if the unsubscribe failed.
    // TODO: Validate params
  */
  svc.unsubscribe = function(span) {
    /* validate
    if (!span ||
      toString.call(span.begin) != '[object Number]'  ||
      toString.call(span.end) != '[object Number]'  ||
      !subscriptionKeys[spanToKey(span)]        ){
      return false;
    }
    */

    delete subscriptionKeys[spanToKey(span)];

    var i,
      len = subscriptions.length;
    for (i=0; i < len; i++) {
      if (subscriptions[i].begin === span.begin && subscriptions[i].end === span.end) {
        subscriptions.splice(i,1); // remove this item
        break;
      }
    }

    return true;
  };

  /*  Allows a timeline provider to be registered with the timeline service. id arg
    is created by the service consumer and will be the unique id by which the provider can
    can be referenced or unregistered later. interval arg is optional and should be a number
    in milliseconds by which scans should occur. If interval is undefined then a default of 1000
    will be used. The scan intervals start as soon as the provider is registered.

    When method is successful it will return a reference to the
    setPlayhead function, which should be called in the service scope via setPlayhead.call().
    If a provider is already registered the method will return false.

    TODO: Invent a secure mechanism by which the setPlayhead function is implicitly tied
    to the providerId (eg: via a dictionary reference). Right now the returned setPlayhead
    function could still be used even after the provider has been unregistered.
    TODO: Validation around id, it must be a primitive that can pass an equality check
    TODO: Validation around interval (sould fall within acceptable range)
  */
  svc.registerProvider = function(id, interval) {
    if (providerId) {
      return false;
    }
    providerId = id;
    // TODO: probably a better way to do this than using the raw window method. This will create
    // testability problems.
    scanIntervalId = $window.setInterval(scan, interval || 1000);
    return setPlayhead;
  };

  /*  Unregisters a timeline provider. Returns true if the operation was successful and
    false if the provider was not registered.
  */
  svc.unregisterProvider = function(id) {
    if (providerId !== id) {
      return false;
    }
    providerId = null;
    $window.clearInterval(scanIntervalId);
    return true;
  };

  return svc;
});
