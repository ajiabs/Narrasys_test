'use strict';

// Declare the player.services module
angular.module('player.services', [])

/*	Timeline Service
	Manages the conceptual timeline for the episode by publishing key topics
	to subscribers. A subscriber must provide a 'span' object which contains
	integer properties 'begin' and 'end'. The service keeps an internal record
	of span states. A span state is active when the playhead is within the begin-end
	range of the span and inactive when it is not. An 'enter' topic will be published
	when the playhead first enters an inactive span, and an 'exit' topic will be
	published when the playhead first exits an active span. The service needs to be
	configured with a timeline provider which keeps the service informed of the playhead
	location, thus synchronizing it with a media item's timeline. A collection of spans
	is iterated on for every playhead change, so performance is directly tied to
	the interval frequency of playhead change events from the timeline provider.
*/
.factory('timeline', ['$window', function(win) {
	var svc = {};

	var spanToKey = function(span) {
		return span.begin + '-' + span.end;
	};

	// Events
	var ENTER = "enter",
		EXIT = "exit";

	// A hashmap of active subscriptions keyed by [span.begin]-[span.end]
	var subscriptions = {};

	/*	Allow consumer to subscribe to enter/exit events for the given span. Span should be
		an object with 'begin' and 'end' properties as positive integers. If the given span
		already exists the subscription will fail. Callback should be a function that accepts
		a span argument (returning the span object) and an event argument (returning the event string).
		Returns true if the subscription was successful and false if the subscription failed.
	 */
	svc.subscribe = function(span, callback) {
		// validate
		if (!span 											||
			!callback 										||
			toString.call(callback) != '[object Function]' 	||
			toString.call(span.begin) != '[object Number]' 	||
			toString.call(span.end) != '[object Number]' 	||
			subscriptions[spanToKey(span)]					){
			return false;
		}

		subscriptions[spanToKey(span)] = {
			begin: span.begin,
			end: span.end,
			isActive: false // TODO: ignorant of playhead position
		};

		return true;
	};

	/* 	Unsubscribe the given span. Unsubscribe will fail if the subscription does not exist.
		Returns true if the unsubscribe was successful and false if the unsubscribe failed.
	*/
	svc.unsubscribe = function(span) {
		// validate
		if (!span ||
			toString.call(span.begin) != '[object Number]' 	||
			toString.call(span.end) != '[object Number]'	||
			!subscriptions[spanToKey(span)]					){
			return false;
		}

		delete subscriptions[spanToKey(span)];

		return true;
	};

	return svc;
}]);