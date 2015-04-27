'use strict';

angular.module('com.inthetelling.story')
	.controller('EventTestController', function ($scope, $routeParams, mockSvc, modelSvc, appState) {
		console.log('EventTestContrller');

		mockSvc.mockEpisode("ep1");
		appState.episodeId = "ep1";

		appState.product = 'producer';
		appState.lang = "en";

		// $scope.itemId = $routeParams["eventId"];

		// $scope.item = modelSvc.events[$routeParams.eventId];

		$scope.itemId = 'internal:editing';

		var items = [{
				_id: 'foo1',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: "This is a sample transcript not being edited"
				},
				annotator: {
					en: "John Doe"
				}
			},

			{
				_id: 'internal:editing',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: ""
				},
				annotator: {
					en: "John Doe"
				},
				asset_id: 'asset2' // TMP
			}, {
				_id: 'foo2',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: "This is a sample transcript not being edited"
				},
				annotator: {
					en: "John Doe"
				}
			}
		];

		$scope.items = [];
		for (var i = 0; i < items.length; i++) {
			modelSvc.cache("event", items[i]);
			$scope.items.push(modelSvc.events[items[i]._id]);
		};

		console.log(modelSvc);

	})
	/* TODO move these somewhere sensible */

.directive('bindVal', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			val: '=bindVal'
		},
		template: '<span ng-class="{lorem: !val}" ng-bind-html="val"></span>',
		link: function (scope) {
			// console.log("scope.val", scope.val);
		}
	};
})

.directive('formField', function () {
	return {
		restrict: 'A',
		transclude: true,
		scope: {
			label: '@formField'
		},
		template: '<div class="field"><div class="label" ng-bind-html="label"></div><div class="input" ng-transclude></div></div>',
		link: function (scope) {
			// console.log("scope.label", scope);
		}
	};
})

.directive('ittContentPane', function () {
	return {
		restrict: 'A',
		replace: 'true',
		scope: {
			items: '=ittContentPane'
		},
		template: '<div class="content" ng-class="{isNarrow: isNarrow()}"><div ng-repeat="item in items" ng-include="\'templates/v2/wrapper/_global.html\'" class="animate"></div></div>',
		link: function (scope, el) {
			console.log("contentpane", scope, el);
			scope.isNarrow = function () {
				return el.width() < 400;
			};
		}
	};
})

.directive('ittTimestamp', function () {
	return {
		restrict: 'A',
		replace: 'true',
		scope: {
			item: '=ittTimestamp',
			pos: '@pos'
		},
		template: '<span ng-include="\'/templates/v2/timestamp/\'+(item.tmpl.timestamp||\'default\')+\'-\'+pos+\'.html\'"></span>',
		link: function () {

		}
	};
})

.directive('ittPositionContent', function () {
	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			ngModel: '='
		},
		templateUrl: '/templates/producer/itempositioncontent.html',
		link: function (scope) {
			console.log("ipc");
			scope.sizeSet = 0;
			scope.posSet = 1;
			var labels = [
				["Left Sidebar", "Inline", "Right Sidebar"],
				["Burst left margin", "Burst margins", "Burst right margin"]
			];
			var vals = [
				["sidebarL", "inline", "sidebarR"],
				["burstL", "burst", "burstR"]
			];

			scope.toggleSize = function () {
				scope.sizeSet = (scope.sizeSet === 0) ? 1 : 0;
				setPos();
			}

			scope.zoneClick = function (x) {
				scope.posSet = x;
				setPos();
			}

			var setPos = function () {
				console.log("setPos", scope.sizeSet, scope.posSet);
				scope.posLabel = labels[scope.sizeSet][scope.posSet];
				scope.ngModel = vals[scope.sizeSet][scope.posSet];
			}

			for (var i = 0; i < vals.length; i++) {
				for (var j = 0; j < vals[i].length; j++) {
					if (vals[i][j] === scope.ngModel) {
						scope.sizeSet = i;
						scope.posSet = j;
					}
				}
			}
			setPos();
		}
	};
})

.directive('ittPositionOverlay', function () {
	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			ngModel: '='
		},
		templateUrl: '/templates/producer/itempositionoverlay.html',
		link: function (scope) {
			console.log("ipo", scope.ngModel);

			var vals = ['tl', 'tr', 'bl', 'br', 'center', 'stretch', 'cover', 'contain'];
			var labels = ['Top left', 'Top right', 'Bottom left', 'Bottom right', 'Centered', 'Stretched', 'Cover', 'Contain'];

			var init = function () {
				for (var i = 0; i < vals.length; i++) {
					if (scope.ngModel === vals[i]) {
						scope.posLabel = labels[i];
						scope.centerType = vals[i];
					}
				}
				if (!scope.posLabel) {
					scope.ngModel = 'center';
					scope.centerType = 'center';
					scope.posLabel = labels[4];
				}

				scope.pinned = (scope.ngModel.length === 2); // HACKish
			}
			init();

			scope.zoneClick = function (x) {
				scope.ngModel = vals[x];
				scope.posLabel = labels[x];
				scope.pinned = (scope.ngModel.length === 2); // HACKish
				if (x > 3) {
					scope.centerType = 'center';
				}
			}

			scope.forceModel = function (evt) {
				// HACK we hijacked ng-model for this directive, so update it via an ng-click handler instead.
				scope.ngModel = evt.currentTarget.options[evt.currentTarget.selectedIndex].value;
				init();
			}

		}
	};
})

.directive('ittItemColorForm', function ($timeout) {
	return {
		restrict: 'A',
		scope: true,
		templateUrl: '/templates/producer/itemcolorform.html',
		link: function (scope) {
			console.log("color form", scope.item);

			if (!scope.item.tmpl.style.textcolor1 && !scope.item.tmpl.style.textcolor2 && !scope.item.tmpl.style.linkcolor) {
				console.log("Found no colors... turn on defaultColors");
				scope.item.tmpl.style.linkcolor = "#0000FF";
				scope.item.tmpl.style.textcolor1 = "#000000";
				scope.item.tmpl.style.textcolor2 = "#000000";
				scope.defaultColors = true; // HACK color-picker wants to init as #FFF, timeout will override
			};

			if (!scope.item.tmpl.style.bgcolor) {
				scope.noBg = true;
			}

			scope.$watch(function () {
				return scope.noBg;
			}, function (newV) {
				console.log("noBg: ", newV);
				if (newV) {
					console.log("Deleting bgcolor");
					delete scope.item.tmpl.style.bgcolor;
				}
			});

			scope.$watch(function () {
				return scope.defaultColors;
			}, function (newV) {
				console.log("defaultColors:", newV);
				if (newV) {
					console.log("Resetting default colors");
					delete scope.item.tmpl.style.linkcolor;
					delete scope.item.tmpl.style.textcolor1;
					delete scope.item.tmpl.style.textcolor2;
				}
			});
		}
	};
})

// TODO needs to support upload, detach, etc
.directive('ittAssetForm', function (modelSvc) {
	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			ngModel: '='
		},
		template: '<div><img ng-src="{{asset.url}}" style="width:60px;height:60px;">TODO</div>',
		link: function (scope) {
			console.log("assetForm TODO", scope.ngModel);
			scope.asset = modelSvc.assets[scope.ngModel];
			console.log(scope.asset);
		}
	};
})

.directive('ittChooserForm', function (modelSvc) {
	/* choices is array of objects each with name, value required; flippable(bool) optional, FUTURE: image(url) optional. */

	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			ngModel: '=',
			inputChoices: '=choices', // [{name: 'foo', value: 'bar'},...]
		},
		templateUrl: '/templates/producer/chooserForm.html',
		link: function (scope) {
			console.log("chooserForm TODO", scope.ngModel, scope.choices);

			scope.flipped = false;
			scope.innerModel = scope.ngModel;
			if (!scope.innerModel) {
				scope.innerModel = scope.inputChoices[0].value; // default to first item in list
			}
			if (scope.innerModel.indexOf('-flip') > 0) {
				scope.innerModel = scope.innerModel.substr(0, scope.innerModel.indexOf('-flip'));
				scope.flipped = true;
			}
			scope.choices = [];
			scope.chooserindex = 0;
			// init: build indexes + find the currently matching one
			for (var i = 0; i < scope.inputChoices.length; i++) {
				var newChoice = angular.copy(scope.inputChoices[i]);
				newChoice.chooserindex = i;
				if (newChoice.value === scope.innerModel) {
					scope.chooserindex = i;
				}
				scope.choices.push(newChoice);
			}

			scope.stepOption = function (i) {
				scope.chooserindex = (scope.chooserindex + i);
				scope.noPrev = (scope.chooserindex === 0);
				scope.noNext = (scope.chooserindex === scope.choices.length);

				scope.updateModel();

			};
			scope.setOption = function (i) {
				scope.picking = !scope.picking;
				scope.chooserindex = i;
				scope.updateModel();
			}
			scope.flip = function () {
				console.log("flipping");
				scope.flipped = !scope.flipped;
				scope.updateModel();
			}

			scope.updateModel = function () {
				var newModel = scope.choices[scope.chooserindex].value;
				if (!scope.choices[scope.chooserindex].flippable) {
					scope.flipped = false;
				}
				if (scope.flipped) {
					newModel = newModel + "-flip";
				}
				scope.ngModel = newModel;
			}

		}
	};
})

;
