'use strict';

angular.module('com.inthetelling.player')
	.directive('ittSearchPanel', function($sce) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/searchpanel.html',
			controller: 'SearchPanelController',
			link: function(scope, element, attrs) {

				console.log("ittSearchPanel", scope);

				// generate searchable text for the episode (on demand).

				// TODO BUGFIX: need to change this to run when the user opens the search panel,
				// not when the search panel is drawn...

				angular.forEach(scope.episode.items, function(item) {
					item.searchableText = (item.annotation || item.description) + " " + (item.title || item.annotator);
					item.trustedDisplayText = $sce.trustAsHtml(item.annotation || item.description);
					item.trustedDisplayTitle = $sce.trustAsHtml(item.title || item.annotator);
				});

			}

		};
	});
