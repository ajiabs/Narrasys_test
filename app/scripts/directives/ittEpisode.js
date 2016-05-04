'use strict';

angular.module('com.inthetelling.story')
	.directive('ittEpisode', function ($interval, analyticsSvc, modelSvc, appState) {
		return {
			restrict: 'A',
			replace: true,
			template: '<span ng-include="episode.templateUrl"></span>',
			controller: 'EpisodeController',
			link: function (scope) {
				scope.ittEpisode = 'i found it!';
				//console.log('ittEpisode', scope);
				scope.episode = modelSvc.episodes[appState.episodeId];
				// TODO: this will break if the timeline and the episode timeline don't match.
				// TODO: check whether this gets called if multiple episodes are added to the timeline... I'm thinking probably not....
				analyticsSvc.captureEpisodeActivity("episodeLoad");

				// I did something stupid here wrt scoping, apparently; 'edit episode' causes this scope to refer to a copy of the data rather than back to the modelSvc cache.
				// This is an even stupider but relatively harmless HACK to keep it  pointing at the right data:
				var scopeHack = function () {
					scope.episode = modelSvc.episodes[appState.episodeId];
					appState.playerTemplate = scope.episode.templateUrl;
				};
				$interval(scopeHack, 457);

				scope.assetUploadedCb = function (assetId) {
					scope.item.asset = modelSvc.assets[assetId];
					// TODO Shouldn't need to be worrying about asset field names here, handle this in modelSvc?
					if (scope.item._type === 'Link') {
						scope.item.link_image_id = assetId;
					} else if (scope.item._type === 'Annotation') {
						scope.item.annotation_image_id = assetId;
					} else {
						scope.item.asset_id = assetId;
					}
					scope.showUploadButtons = false;
					scope.showUploadField = false;
				};

				var isInternal = function (item) {
					return (item._id && item._id.match(/internal/));
				};

				scope.getItemsAfter = function (items, after) {
					var itemsAfter = [];
					for (var i = 0, len = items.length; i < len; i++) {
						if (!isInternal(items[i])) {
							if (after < items[i].start_time || after < items[i].end_time) {
								itemsAfter.push(items[i]);
							}
						}
					}
					return itemsAfter;
				};

			}

		};
	});
