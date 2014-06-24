'use strict';

/* 

TODO:
		There are 2 new fields that get returned with the get_access_token call.  They are as follows:  "track_event_actions":true  and "track_episode_metrics":true
		Please use those to determine whether or not we should be tracking data about users.  They default to true but will give us the ability to override this behavior at the customer or user level.  User level takes precedence.



There are two separate types of user activity to capture, which go to separate API endpoints.
Some types must contain additional info in a "data" object:

episode activity:
	episodeLoad					triggered immediately when episode is loaded
	episodeEnd					triggered when user reaches end of episode
	play								triggered when user hits play
	pause								triggered when user hits pause
	seek								triggered whenever user changes the playhead position.
												seekFrom:	timestamp of origin
												method:		"scrubTimeline", "sceneMenu", "nextScene", "prevScene", "clickedOnEvent".
												eventID:	include if method was "clickedOnEvent"
	modeChange					triggered when episode is loaded (since default isn't always the same), and on user changes of mode
												mode: "watch","discover","review"
	playbackRateChange	triggered when user changes the playback speed
												playbackRate: 1
	search (TODO)				(search is incremental, so will have to think about how/when to capture this)


event activity: captures interaction with specific transmedia items ("events").
Different types of event can define their own interactions, but the core ones will be
	viewed						player reached the event's start_time by any method
	interacted				user clicked a transmedia link, for example
	completed					up to the transmedia item to define what constitutes "completion"

*/

angular.module('com.inthetelling.player')
	.factory('analyticsSvc', function($q, $http, $routeParams, $interval, config, modelSvc) {
		console.log('analyticsSvc factory');
		var svc = {};

		svc.activityQueue = []; // contains events not yet sent to the server.

		var flusher = $interval(function() {
			svc.flushActivityQueue();
		}, 5000);

		// don't try to capture when running from local data:
		if ($routeParams.local) {
			console.log("No analytics for local data; cancelling activity queue");
			$interval.cancel(flusher);
		}

		// for episode-related activity
		svc.captureEpisodeActivity = function(name, data) {
			var userActivity = {
				"name": name,
				"walltime": new Date(),
				"timestamp": modelSvc.appState.time, // TODO this is timeline time, we want episode time!
			};
			if (data) {
				userActivity.data = data;
			}
			svc.activityQueue.push(userActivity);
		};

		// for transmedia-related activity
		svc.captureEventActivity = function(name, eventID, data) {
			svc.activityQueue.push({
				"name": name,
				"event_id": eventID,
				"walltime": new Date()
			});
		};

		// read from API:
		svc.readEpisodeActivity = function(epId) {
			var defer = $q.defer();
			$http({
				method: 'GET',
				url: config.apiDataBaseUrl + '/v2/episodes/' + epId + '/episode_user_metrics'
			}).success(function(respData, respStatus, respHeaders) {
				console.log("read episode activity SUCCESS", respData, respStatus, respHeaders);
				defer.resolve(respData);
			}).error(function(respData, respStatus, respHeaders) {
				console.log("read episode activity ERROR", respData, respStatus, respHeaders);
				defer.reject();
			});
			return defer.promise;
		};

		// if activityType is omitted, returns all user data for that event id
		// if it's included, returns true if the user has at least once triggered that activityType, false if not
		svc.readEventActivity = function(eventId, activityType) {
			var defer = $q.defer();
			$http({
				method: 'GET',
				url: config.apiDataBaseUrl + '/v2/events/' + eventId + '/event_user_actions'
			}).success(function(respData, respStatus, respHeaders) {
				console.log("read event activity SUCCESS", respData, respStatus, respHeaders);
				if (activityType) {
					var matchedType = false;
					for (var i = 0; i < respData.length; i++) {
						var activity = respData[i];
						if (activity.name === activityType) {
							matchedType = true;
						}
					}
					defer.resolve(matchedType);
				} else {
					// no activityType specified so return everything:
					defer.resolve(respData);
				}
			}).error(function(respData, respStatus, respHeaders) {
				console.log("read event activity ERROR", respData, respStatus, respHeaders);
				defer.reject();
			});
			return defer.promise;
		};


		svc.flushActivityQueue = function() {
			console.log("flush interval");
			if (svc.activityQueue.length === 0) {
				return;
			}
			var actions = angular.copy(svc.activityQueue);
			svc.activityQueue = [];

			var now = new Date();
			var episodeUserMetrics = [];
			var eventUserActions = [];

			angular.forEach(actions, function(action) {
				action.age = (now - action.walltime) / 1000;
				delete action.walltime;
				if (action.event_id) {
					eventUserActions.push(action);
				} else {
					episodeUserMetrics.push(action);
				}
			});

			if (eventUserActions.length) {
				console.log("Event actions to log:", eventUserActions);
				// /v2/episodes/<episode id>/event_user_actions
				post("event_user_actions", {
					"event_user_actions": eventUserActions
				});

			}
			if (episodeUserMetrics.length) {
				console.log("Episode metrics to log:", episodeUserMetrics);
				post("episode_user_metrics", {
					"episode_user_metrics": episodeUserMetrics
				});
			}
		};

		var post = function(endpoint, endpointData) {
			$http({
				method: 'POST',
				url: config.apiDataBaseUrl + '/v2/episodes/' + modelSvc.appState.episodeId + '/' + endpoint,
				data: endpointData
			}).success(function(respData, respStatus, respHeaders) {
				console.log("SUCCESS", respData, respStatus, respHeaders);

			}).error(function(respData, respStatus, respHeaders) {
				console.log("ERROR", respData, respStatus, respHeaders);
			});
		};

		return svc;
	});
