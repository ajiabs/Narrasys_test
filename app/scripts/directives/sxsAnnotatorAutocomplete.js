'use strict';

/* 

	TODO:

	Allow adding new annotator name
	Allow uploading annotator asset

	Allow replacing annotator asset

	select contents of searchText on focus



*/

angular.module('com.inthetelling.story')
	.directive('sxsAnnotatorAutocomplete', function (modelSvc, $timeout) {
		return {
			require: 'ngModel',
			templateUrl: "templates/producer/annotator-autocomplete.html",
			scope: {
				annotators: "=sxsAnnotatorAutocomplete",
				item: "=item"
			},
			link: function (scope, element, attrs, ngModelController) {

				angular.forEach(scope.annotators, function (annotator) {
					annotator.imageUrl = modelSvc.assets[annotator.annotation_image_id].url;
				});
				scope.annotator = {
					name: scope.item.annotator
				};

				scope.searchText = scope.item.annotator;
				scope.filteredAnnotators = angular.copy(scope.annotators);
				scope.preselectedItem = -1;

				element.find('.inputOnly').bind("keydown", function (event) {
					switch (event.which) {
					case 40: // down arrow
						scope.preselectedItem = (scope.preselectedItem + 1) % Object.keys(scope.filteredAnnotators).length;
						break;
					case 38: // up arrow
						scope.preselectedItem = (scope.preselectedItem - 1) % Object.keys(scope.filteredAnnotators).length;
						break;
					case 13: // enter
						event.preventDefault();
						if (scope.preselectedItem > -1) {
							scope.selectByIndex(scope.preselectedItem);
						}
						break;
					default:
					}
				});
				scope.$watch(function () {
					return scope.searchText;
				}, function (newVal) {
					if (newVal) {
						scope.annotator.name = '';
						scope.preselectedItem = -1;
						var newFilter = {};
						angular.forEach(scope.annotators, function (annotator) {
							if (annotator.name.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1) {
								newFilter[annotator.name] = annotator;
							}
						});

						scope.filteredAnnotators = newFilter;
						// if only one left, select it automatically
						if (Object.keys(scope.filteredAnnotators).length === 1) {
							scope.preselectedItem = 0;
						}

						// if none left, show an "add new" button
						scope.allowAddNew = (Object.keys(scope.filteredAnnotators).length === 0);
					} else {
						// empty searchText, show all autocomplete options
						scope.filteredAnnotators = angular.copy(scope.annotators);
						scope.allowAddNew = false;
						scope.preselectedItem = -1;
					}

				});

				scope.selectByIndex = function (index) {
					if (index < 0) {
						return;
					}
					var names = Object.keys(scope.filteredAnnotators).sort();
					scope.select(scope.filteredAnnotators[names[index]]);
				};

				scope.select = function (annotator) {
					scope.annotator.name = annotator.name;
					scope.item.annotation_image_id = annotator.annotation_image_id;
					scope.item.asset = modelSvc.assets[annotator.annotation_image_id];
					ngModelController.$setViewValue(annotator.name);
					scope.searchText = annotator.name;
				};

				scope.autoCompleting = false;
				scope.showAutocomplete = function () {

					scope.autoCompleting = true;
				};

				scope.hideAutocomplete = function () {
					$timeout(function () {
						if (scope.preselectedItem > -1) {
							scope.selectByIndex(scope.preselectedItem);
						} else {
							// TODO: reset fields?
						}
						scope.autoCompleting = false;
					}, 100);
				};

				scope.addNewAnnotator = function () {
					window.alert("TODO: add annotator " + scope.searchText + " and allow uploading an asset for it");
				};

			}
		};
	});
