'use strict';
/*
directives for user input, custom form fields, etc

formField
ittItemColorForm
ittAssetForm
ittChooserForm

*/
angular.module('com.inthetelling.story')
	.directive('formField', function () {
		return {
			restrict: 'A',
			transclude: true,
			scope: {
				label: '@formField'
			},
			template: '<div class="field"><div class="label" ng-bind-html="label"></div><div class="input" ng-transclude></div></div>',
			link: function () {
				// console.log("scope.label", scope);
			}
		};
	})
	.directive('ittItemColorForm', function () {
		return {
			restrict: 'A',
			scope: true,
			templateUrl: '/templates/producer/itemcolorform.html',
			link: function (scope) {
				console.log("color form", scope.item);

				if (!scope.item.tmpl.style.font1.color && !scope.item.tmpl.style.font2.color && !scope.item.tmpl.style.linkcolor) {
					console.log("Found no colors... turn on defaultColors");
					scope.item.tmpl.style.linkcolor = "#0000FF";
					scope.item.tmpl.style.font1.color = "#000000";
					scope.item.tmpl.style.font2.color = "#000000";
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
						delete scope.item.tmpl.style.font1.color;
						delete scope.item.tmpl.style.font2.color;
					}
				});
			}
		};
	})
	.directive('ittAssetForm', function (modelSvc) {
		// TODO needs to support upload, detach, etc
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			template: '',
			// template: '<div><img ng-src="{{asset.url}}" style="width:60px;height:60px;">TODO</div>',
			link: function (scope) {
				console.log("assetForm TODO", scope.ngModel);
				scope.asset = modelSvc.assets[scope.ngModel];
				console.log(scope.asset);
			}
		};
	})
	.directive('ittChooserForm', function () {
		/* choices is array of objects each with name, value required; flippable(bool) optional, FUTURE: image(url) optional. */

		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				ngModel: '=',
				item: '=',
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
					// scope.picking = !scope.picking;
					scope.chooserindex = i;
					scope.updateModel();
				};
				scope.flip = function () {
					console.log("flipping");
					scope.flipped = !scope.flipped;
					scope.updateModel();
				};

				scope.updateModel = function () {
					var newModel = scope.choices[scope.chooserindex].value;
					if (!scope.choices[scope.chooserindex].flippable) {
						scope.flipped = false;
					}
					if (scope.flipped) {
						newModel = newModel + "-flip";
					}
					scope.ngModel = newModel;
				};

			}
		};
	})

;
