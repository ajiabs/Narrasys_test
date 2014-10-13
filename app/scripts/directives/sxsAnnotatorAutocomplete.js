'use strict';

/* 

	TODO:
	keyboard controls: 
		arrows to move selection up and down
		"return" to choose preselected item

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
				console.log(">", scope.item);
				scope.searchText = scope.item.annotator;
				scope.filteredAnnotators = angular.copy(scope.annotators);

				scope.$watch(function () {
					return scope.searchText;
				}, function (newVal) {
					if (newVal) {
						scope.annotator.name = '';
						var newFilter = [];
						angular.forEach(scope.annotators, function (annotator) {
							delete(annotator.isPreSelected);
							if (annotator.name.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1) {
								newFilter.push(annotator);
							}
						});

						scope.filteredAnnotators = newFilter;
						// if only one left, select it automatically
						if (scope.filteredAnnotators.length === 1) {
							scope.filteredAnnotators[0].isPreSelected = true;
						}

						// if none left, show an "add new" button
						scope.allowAddNew = (scope.filteredAnnotators.length === 0);

					} else {
						// empty searchText, show all autocomplete options
						scope.filteredAnnotators = angular.copy(scope.annotators);
						scope.allowAddNew = false;
					}

				});

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
						scope.autoCompleting = false;
					}, 300);
				};

				scope.addNewAnnotator = function () {
					window.alert("TODO: add annotator " + scope.searchText + " and allow uploading an asset for it");
				};

			}
		};
	});
