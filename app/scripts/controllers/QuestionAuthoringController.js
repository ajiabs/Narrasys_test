'use strict';
/*
Temporary and very very sloppy: 

standalone controller to convert question form fields into plugin JSON and vice versa

We'll link to this from existing authoring tool for now, tie it into real producer when there is one

*/

/*

angular.module('com.inthetelling.story')
	.controller('QuestionAuthoringController', function ($scope, $timeout) {

		// scope.question = the question data as entered
		// scope.pluginjson = the cleaned json field to be cut/pasted into authoring tool
		// scope.question = the cleaned version of the question data to be put in the preview field

		$scope.addDistractor = function () {
			$scope.question.distractors.push({
				text: ''
			});
		};

		$scope.init = function () {
			$scope.question = {
				questiontext: '',
				questiontype: 'mc-formative',
				distractors: []
			};
			$scope.addDistractor();
			$scope.addDistractor();
			$scope.addDistractor();
			$scope.addDistractor();
			$scope.sampleitem = {
				_id: "sample",
				type: "Plugin",
				start_time: 0,
				templateUrl: "templates/item/question-" + $scope.question.questiontype + ".html",
				data: $scope.pluginjson
			};
		};

		$scope.init();

		// watch for changes to form fields:
		$scope.$watch(function () {
			return $scope.question;
		}, function () {
			if ($scope.selfediting) {
				return;
			}
			$scope.fieldediting = true;
			$scope.editwarning = false;

			// build up a tidied version of what's in the form fields (if we just use plain $scope.question we end up with extra junk in the json)
			var cleanquestion = {
				questiontext: $scope.question.questiontext,
				questiontype: $scope.question.questiontype,
				distractors: []
			};
			for (var i = 0; i < $scope.question.distractors.length; i++) {
				var distractor = $scope.question.distractors[i];
				if (distractor.text) {
					if ($scope.question.questiontype === 'mc-formative' && distractor.correct) {
						cleanquestion.distractors.push({
							text: distractor.text,
							correct: true
						});
					} else {
						cleanquestion.distractors.push({
							text: distractor.text
						});
					}
				}
			}
			if ($scope.question.questiontype === 'mc-formative') {
				cleanquestion.correctfeedback = $scope.question.correctfeedback;
				cleanquestion.incorrectfeedback = $scope.question.incorrectfeedback;
			}

			$scope.sampleitem = {
				_id: "sample",
				type: "Plugin",
				start_time: 0,
				templateUrl: "templates/item/question-" + $scope.question.questiontype + ".html",
				data: {
					"_pluginType": "question",
					"_version": 1,
					"_plugin": cleanquestion
				}
			};

			$scope.pluginjson = angular.toJson($scope.sampleitem.data);
			$timeout(function () {
				$scope.updatePreview();
				$scope.fieldediting = false;
			});
		}, true);

		// watch for direct editing of the json field:
		$scope.$watch(function () {
			return $scope.pluginjson;
		}, function () {
			if ($scope.fieldediting) {
				return;
			}
			$scope.selfediting = true;
			console.log('editing json directly');
			var unjson;
			$scope.editwarning = false;
			try {
				unjson = angular.fromJson($scope.pluginjson);
				$scope.question = unjson._plugin;
			} catch (e) {
				$scope.editwarning = true;
			}

			$timeout(function () {
				$scope.sampleitem.data._plugin = angular.fromJson($scope.pluginjson);
				$scope.updatePreview();
				$scope.selfediting = false;
			});
		});

		$scope.updatePreview = function () {
			$scope.preview = false; // unlinks the item directive so it can pick up a new template if necessary
			$timeout(function () {
				$scope.questionpreview = $scope.sampleitem;
				$scope.preview = true;
			});

		};

	});
*/
