angular.module('com.inthetelling.story')
	.controller('EventActionsController', function ($scope, $rootScope, appState, dataSvc, modelSvc, timelineSvc) {
			var answers = [{
				"_id": "549dadc021e37fbf0c00000f",
				"action_at": "2014-12-26T18:49:35Z",
				"data": {
					"_id": "549dadc021e37fbf0c000010",
					"answer": "c",
					"correct": false
				},
				"episode_id": "537123762442bd8432000004",
				"event_id": "549dad8721e37fbf0c000003",
				"name": "question-answered",
				"user_id": "5494786021e37f20f0000001"
			}, {
				"_id": "549db0a521e37fb0d8000003",
				"action_at": "2014-12-26T19:01:52Z",
				"data": {
					"_id": "549db0a521e37fb0d8000004",
					"answer": "b",
					"correct": false
				},
				"episode_id": "537123762442bd8432000004",
				"event_id": "549dad8721e37fbf0c000003",
				"name": "question-answered",
				"user_id": "549db09121e37f8eb3000003"
			}];


			var actionJson = {
				"actor": {
					"type": "person",
					"id": "1234"
				},
				"verb": "answer",
				"target": {
					"plugin_id": "1234",
					"plugin_type": "question",
					"type": "poll-question",
					"id": "7890"
				},
				"metadata": {
					"answertext": "blah blah",
					"id": "7524"
				}
			};
			// episodes/213/events
			//
			// questions/1234
			// questions/1234/responses/
			// questions/1234/responses
			// partners/1234/questions/1234/responses ? are questions limited to institutions?
			// couple "correctness" inside of response. this is easier. instead of separating scoring.
			// questions/1234/responsesReport
			//
			var responsesJson = [{
				"id": "12342",
				"userid": "ywe90723",
				"text": "Answer 2",
				"number": "0",
				"isCorrect": "false",
				"partnerId": "questions scoped to institution??"
			}];

			$scope.getAnswers(eventId) {
				console.log('getting event actions', eventId);
			}
		}
