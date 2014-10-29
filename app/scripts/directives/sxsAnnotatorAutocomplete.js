'use strict';

/* 

	TODO:

	Allow uploading annotator asset

	Allow replacing annotator asset

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
					if (annotator.annotation_image_id) {
						annotator.imageUrl = modelSvc.assets[annotator.annotation_image_id].url;
					}
				});
				// TODO prefill current annotator image
				scope.annotator = {
					name: scope.item.annotator

				};
				if (scope.annotators[scope.item.annotator] && scope.annotators[scope.item.annotator].annotation_image_id) {
					scope.annotator.imageUrl = modelSvc.assets[scope.annotators[scope.item.annotator].annotation_image_id].url;
				}
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

				scope.handleAutocomplete = function () {
					scope.annotator.name = '';
					if (scope.searchText) {

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

				};

				scope.selectByIndex = function (index) {
					if (index < 0) {
						return;
					}
					var names = Object.keys(scope.filteredAnnotators).sort();
					scope.select(scope.filteredAnnotators[names[index]]);
				};

				scope.select = function (annotator) {
					scope.preselectedItem = -1;
					scope.annotator.name = annotator.name;
					if (annotator.annotation_image_id) {
						scope.item.annotation_image_id = annotator.annotation_image_id;
						scope.item.asset = modelSvc.assets[annotator.annotation_image_id];
						scope.annotator.imageUrl = scope.item.asset.url;
					} else {
						// TODO allow adding new image
						delete scope.annotator.imageUrl;
						delete scope.item.asset;
					}
					ngModelController.$setViewValue(annotator.name);
					scope.searchText = annotator.name;

					//TODO  allow upload to replace image
				};

				scope.autoCompleting = false;
				scope.showAutocomplete = function () {
					var inputField = element.find('.inputOnly')[0];
					inputField.setSelectionRange(0, inputField.value.length);
					scope.autoCompleting = true;
				};

				scope.hideAutocomplete = function () {
					$timeout(function () {
						if (scope.preselectedItem > -1) {
							scope.selectByIndex(scope.preselectedItem);
						}
						scope.autoCompleting = false;
					}, 300);
				};

				scope.addNewAnnotator = function () {
					var annotatorName = scope.searchText; // TODO sanitize me!!!
					var newAnnotator = {
						"name": annotatorName,
						"imageUrl": "",
						"annotation_image_id": false
					};
					scope.annotators.annotatorName = newAnnotator; // make available in future transcript edits
					scope.annotator.name = annotatorName;
					delete scope.annotator.imageUrl;
					ngModelController.$setViewValue(annotatorName);

					// trigger autocomplete to match the newly added annotator
					scope.handleAutocomplete();

				};

				scope.uploadAnnotatorImage = function () {
					window.alert("TODO");
					// For replacing existing annotator thumbnails, do we need to go through every transcript node with that speaker and replace its annotator ID? TODO check with Bill how he ahndles that in old authoring

				};
			}
		};
	});
