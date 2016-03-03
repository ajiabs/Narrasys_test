'use strict';

/*
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
	stall								triggered when video playback stalls unintentionally
	lowBandwidth				triggered when we switch to a lower-bandwidth video stream due to too many stall events
	search (TODO)				(search is incremental, so will have to think about how/when to capture this)

event activity: captures interaction with specific transmedia items ("events").
Different types of event can define their own interactions, but the core ones will be
	viewed							player reached the event's start_time by any method
	interacted					user clicked a transmedia link, for example
	completed						up to the transmedia item to define what constitutes "completion"
	question-answered		for quiz questions.  Data field should be {answer: 'answer text', correct: t/f}
*/

angular.module('com.inthetelling.story')
	.factory('analyticsSvc', function ($q, $http, $routeParams, $interval, $timeout, config, appState) {
		// console.log('analyticsSvc factory');
		var svc = {};

		svc.activityQueue = []; // contains events not yet sent to the server.

		var flusher = $interval(function () {
			svc.flushActivityQueue();
		}, 10000);

		// don't try to capture when running from local data or if it's disabled in config:
		if ($routeParams.local || config.disableAnalytics) {
			// console.log("No analytics for local data; cancelling activity queue");
			$interval.cancel(flusher);
		}

		// for episode-related activity
		svc.captureEpisodeActivity = function (name, data) {
			if (config.disableAnalytics) {
				return;
			}
			if (
				(appState.user && appState.user._id) &&
				(!appState.user.track_episode_metrics)
			) {
				return;
			}
			var userActivity = {
				"name": name,
				"walltime": new Date(),
				"timestamp": appState.time, // TODO this is timeline time, we want episode time!
			};
			if (data) {
				userActivity.data = data;
			}

			svc.activityQueue.push(userActivity);
		};

		// for transmedia-related activity
		svc.captureEventActivity = function (name, eventID, data, force) {
			if (!force) {
				if (config.disableAnalytics || (appState.user._id && !appState.user.track_event_actions)) {
					return;
				}
			}
			if (data === undefined) {
				console.warn("captureEventActivity called with no data for event ", eventID);
			}
			// console.log(data);
			svc.activityQueue.push({
				"name": name,
				"event_id": eventID,
				"walltime": new Date(),
				"data": data
			});
		};

		svc.forceCaptureEventActivityWithPromise = function (name, eventID, data) {
			//we know this is syncronous
			svc.captureEventActivity(name, eventID, data, true);
			return svc.flushActivityQueue(); //this is async, and returns a promise.
		};
		svc.captureEventActivityWithPromise = function (name, eventID, data) {
			//we know this is syncronous
			svc.captureEventActivity(name, eventID, data);
			return svc.flushActivityQueue(); //this is async, and returns a promise.
		};

		// read from API:
		svc.readEpisodeActivity = function (epId) {
			// console.log("analyticsSvc readEpisodeActivity");
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/v2/episodes/' + epId + '/episode_user_metrics'
				})
				.success(function (respData) {
					// console.log("read episode activity SUCCESS", respData, respStatus, respHeaders);
					defer.resolve(respData);
				})
				.error(function () {
					// console.log("read episode activity ERROR", respData, respStatus, respHeaders);
					defer.reject();
				});
			return defer.promise;
		};

		// if activityType is omitted, returns all user data for that event id
		// if it's included, returns true if the user has at least once triggered that activityType, false if not
		svc.readEventActivity = function (eventId, activityType) {
			// console.log("analyticsSvc.readEventActivity", "eventId", "activityType");
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/v2/events/' + eventId + '/event_user_actions'
				})
				.success(function (respData) {
					// console.log("read event activity SUCCESS", respData, respStatus, respHeaders);
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
				})
				.error(function () {
					// console.log("read event activity ERROR", respData, respStatus, respHeaders);
					defer.reject();
				});
			return defer.promise;
		};

		svc.flushActivityQueue = function () {
			var defer = $q.defer();
			if (svc.activityQueue.length === 0) {
				defer.resolve("");
			}
			if (!appState.episodeId) {
				defer.resolve(); // iOS with ?t= param is trying to post metrics before it has an episode ID. TODO figure out wtf is causing that...
			}

			var actions = angular.copy(svc.activityQueue);
			svc.activityQueue = [];

			var now = new Date();
			var episodeUserMetrics = [];
			var eventUserActions = [];

			angular.forEach(actions, function (action) {
				action.age = (now - action.walltime) / 1000;
				delete action.walltime;
				if (action.event_id) {
					eventUserActions.push(action);
				} else {
					episodeUserMetrics.push(action);
				}
			});
			episodeUserMetrics = svc.dejitter(episodeUserMetrics);

			var posts = [];
			if (eventUserActions.length > 0) {
				posts.push($http.post(config.apiDataBaseUrl + '/v2/episodes/' + appState.episodeId + '/event_user_actions', {
					"event_user_actions": eventUserActions
				}));
			}
			if (episodeUserMetrics.length > 0) {
				posts.push($http.post(config.apiDataBaseUrl + '/v2/episodes/' + appState.episodeId + '/episode_user_metrics', {
					"episode_user_metrics": episodeUserMetrics
				}));
			}
			$q.all(posts).then(function () {
				defer.resolve();
			}).catch(function(e) {
				//only try to recover from session timeout errors.
				if (e.status === 401 && e.data.error === 'Authentication expired. Please log in again.') {
					return handleFailedReport(e.config.data);
				}
			});

			function handleFailedReport(missedReports) {
				var dfds = [];
				//timeout for 2 seconds in order to let
				//the errorSvc handle renewing session.
				$timeout(function() {
					angular.forEach(missedReports, function(data, reportType) {
						var urlStr  = config.apiDataBaseUrl + '/v2/episodes/' + appState.episodeId + '/' + reportType;
						var payLoad = {};
						payLoad[reportType] = data;

						dfds.push($http.post(urlStr, payLoad));
					});

				}, 2000).then(function() {
					$q.all(dfds).then(function(resp) {
						console.log('sweet fulfillment!', resp);
					});
				});
			}

			return defer.promise;
		};

		svc.dejitter = function (events) {
			// Consolidate repeated seek events into one single seek event before sending to API.
			// TODO prevent this happening in the first place :)
			if (events.length === 0) {
				return [];
			}
			var ret = [];
			for (var i = 0; i < events.length - 1; i++) {
				// if this event and the next one are both seek events, and this event's timestamp matches
				// the next event's seekStart, skip this event and set the next event's seekStart to this one's.
				// otherwise just put it into the queue.
				var a = events[i];
				var b = events[i + 1];
				if (a.name === "seek" && b.name === "seek" &&
					(a.timestamp === b.data.seekStart)) {
					b.data.seekStart = a.data.seekStart;
				} else {
					ret.push(events[i]);
				}
			}
			ret.push(events[events.length - 1]);
			return ret;
		};

		return svc;
	});
