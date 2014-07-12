'use strict';

// TODO for writing to API

// TESTING:
// badge event is 53a1d2162442bd24f9000004
// m/c event is 539a0d182442bd86f1000004

// badge template ID is 53a1d0672442bd95b1000002
// m/c template id is 539a07ee2442bd20bf000006


//  use PUT to update, POST to create new   
// for assets, DELETE then POST
// Wrap events in event: {}   same for other things?  template didn't seem to need it


angular.module('com.inthetelling.player')
	.factory('producerSvc', function($q, $http, $routeParams, $timeout, config) {
		var svc = {};


		// svc.createTemplate = function() {
		// 	$http({
		// 		method: 'POST',
		// 		url: config.apiDataBaseUrl + '/v1/templates',
		// 		data: {
		// 			name: "USC Credly Badge",
		// 			url: "templates/item/usc-badges.html"
		// 		}
		// 	}).success(function(data, status, headers) {
		// 		console.log("Created template:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed to create template", data, status, headers);
		// 	});
		// };


		// svc.deleteEvent = function() {
		// 	$http({
		// 		method: 'DELETE',
		// 		url: config.apiDataBaseUrl + '/v2/events/53874f002442bd7726000001', // note different from docs!
		// 	}).success(function(data, status, headers) {
		// 		console.log("deleted event:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed ", data, status, headers);
		// 	});
		// };

		// svc.updateTemplate = function() {
		// 	$http({
		// 		method: 'PUT',
		// 		url: config.apiDataBaseUrl + '/v1/templates/539a07ee2442bd20bf000006',
		// 		data: {
		// 			name: "Multiple choice question",
		// 			url: "templates/item/multiplechoice.html",
		// 			event_types: ["Plugin"]
		// 		}
		// 	}).success(function(data, status, headers) {
		// 		console.log("Created template:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed to create template", data, status, headers);
		// 	});
		// };

		// svc.createEvent = function() {

		// 	var newEvent = {
		// 		episode_id: "533aec182442bdd34c000003",
		// 		type: "Plugin",
		// 		start_time: 386,
		// 		data: {
		// 			"foo": "bar"
		// 		},
		// 		template_id: "539a07ee2442bd20bf000006"
		// 	};


		// 	$http({
		// 		method: 'POST',
		// 		url: config.apiDataBaseUrl + '/v2/episodes/533aec182442bdd34c000003/events/',
		// 		data: {
		// 			event: newEvent
		// 		}
		// 	}).success(function(data, status, headers) {
		// 		console.log("Created event:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed to create event", data, status, headers);
		// 	});
		// };

		// svc.updateEvent = function() {
		// 	var pluginData = {
		// 		"_pluginType": "credlyBadge",
		// 		"_version": 1,
		// 		"_plugin": {
		// 			"achievement": "Friend of USC Scholar John Wilson",
		// 			"requirements": [{
		// 				name: "Answered the multiple choice question at the end of this episode",
		// 				eventId: "539a0d182442bd86f1000004",
		// 				activity: "question-answered"
		// 			}, {
		// 				name: "Clicked the UNEP Green Economy link at 0:01 in this episode",
		// 				eventId: "533b01dd2442bdd7f6000003",
		// 				activity: "clicked"
		// 			}],
		// 			"credlyBadgeId": 19578
		// 		}
		// 	};
		// 	var eventData = {
		// 		episode_id: "533aec182442bdd34c000003",
		// 		type: "Plugin",
		// 		start_time: 386,
		// 		end_time: 387,
		// 		data: pluginData,
		// 		stop: true,
		// 		layout_id: ["528d17eeba4f65e57800001e"], // windowFg
		// 		template_id: "53a1d0672442bd95b1000002"
		// 	};

		// 	$http({
		// 		method: 'PUT',
		// 		url: config.apiDataBaseUrl + '/v2/events/53a1d2162442bd24f9000004',
		// 		data: {
		// 			event: eventData
		// 		}
		// 	}).success(function(data, status, headers) {
		// 		console.log("Created event:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed:", data, status, headers);
		// 	});
		// };

		// svc.updateEvent = function() {
		// 	var pluginData = {
		// 		"_pluginType": "multiplechoice",
		// 		"_version": 1,
		// 		"_plugin": {
		// 			"question": "This is the question text. Here's an umlaut, to test utf-8: ü",
		// 			"distractors": [{
		// 				"text": "This is the first distractor",
		// 				"feedback": "The text to be shown if the first answer was selected."
		// 			}, {
		// 				"text": "This is the second distractor",
		// 				"feedback": "If the second distractor is chosen, show this text."
		// 			}, {
		// 				"text": "This is the third distractor",
		// 				"feedback": "The text to be shown if you answer correctly by selecting this.",
		// 				"correct": true
		// 			}]
		// 		}
		// 	};
		// 	var eventData = {
		// 		episode_id: "533aec182442bdd34c000003",
		// 		type: "Plugin",
		// 		start_time: 385,
		// 		end_time: 386,
		// 		data: pluginData,
		// 		stop: true,
		// 		template_id: "539a07ee2442bd20bf000006"
		// 	};
		// 	$http({
		// 		method: 'PUT',
		// 		url: config.apiDataBaseUrl + '/v2/events/539a0d182442bd86f1000004', // event ID
		// 		data: {
		// 			event: eventData
		// 		}
		// 	}).success(function(data, status, headers) {
		// 		console.log("Updated event:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed:", data, status, headers);
		// 	});
		// };


		svc.storeEvent = function(eventData) {
			console.log("TODO");
		};

		svc.storeEpisode = function(episodeData) {
			console.log("TODO");
		};

		svc.storeAsset = function(assetData) {
			console.log("TODO");
		};


		return svc;
	});
