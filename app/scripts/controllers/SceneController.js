'use strict';

angular.module('com.inthetelling.story')
	.controller('SceneController', function ($scope, $filter, $log, demoService, appState, modelSvc, demoMock) {

		$scope.byPullquoteOrH2 = byPullquoteOrH2;
		$scope.selectLayout = selectLayout;
		$scope.imageSwap = imageSwap;
		$scope.pdfSwap = pdfSwap;
		$scope.pqSwap = pqSwap;
		$scope.videoSwap = videoSwap;

		$scope.demo = demoService;
		$scope.$log = $log;
		$scope.episode = modelSvc.episodes[appState.episodeId];


		function _addPqTest() {
			$scope.mainContentItems = [demoMock.addStubPq()];
		}

		function selectLayout() {
			$scope.demo.selectLayout();
		}

		function imageSwap(fileList) {
			console.log('img swap wired up!!', fileList);
			demoMock.imageAsset(fileList).then(function(img) {
				$scope.altContentItems.push(img);
				console.log('new img', img);
				$scope.demo.replaceImage();
			});
		}

		function pdfSwap() {
			$scope.altContentItems.push(demoMock.stubPdf);
			$scope.demo.replacePdf();

		}

		function pqSwap(e) {
			//console.log("ev in ctrl", e);
			_addPqTest();
			console.log(e);
			e.currentTarget.remove();
			$scope.demo.replacePq();
		}

		function videoSwap() {
			$scope.demo.replaceVideo();
		}

		$scope.attachMasterVideoCb = function (asset_id) { // master asset only!
			console.log('replacing master asset!', $scope.episode);
			var asset = modelSvc.assets[asset_id];
			console.log('asset', asset);
			var previousAsset = modelSvc.assets[$scope.episode.master_asset_id];
			console.log('prev', previousAsset);
			$scope.showmessage = "New video attached.";
			//if (previousAsset && (asset.duration < previousAsset.duration)) {
			//	var orphans = $scope.getItemsAfter($scope.episode.items.concat($scope.episode.scenes), asset.duration);
			//	if (orphans.length) {
			//		// TODO i18n
			//		$scope.showmessage = "Warning: this new video is shorter than the current video and we've detected that some existing content items will be impacted. If you save this edit, these events will have their start and end times adjusted to the new episode end. (If this isn't what you want, choose a different video or hit 'cancel'.)";
			//	}
			//}

			$scope.episode._master_asset_was_changed = true;
			$scope.episode.master_asset_id = asset._id;
			$scope.masterAsset = asset;
			$scope.episode.masterAsset = asset;
			$scope.demo.replaceVideo();
			modelSvc.deriveEpisode(modelSvc.episodes[appState.episodeId]);
		};

		var isInternal = function (item) {
			return (item._id && item._id.match(/internal/));
		};

		$scope.getItemsAfter = function (items, after) {
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

		$scope.precalculateSceneValues = function () {
			// console.log("precalcSceneValues");

			// clear out old calculations in case we're re-precalculating
			delete $scope.mainContentHasLeftSidebar;
			delete $scope.mainContentHasRightSidebar;
			delete $scope.mainContentHasBothSidebars;
			delete $scope.altContentHasLeftSidebar;
			delete $scope.altContentHasRightSidebar;
			delete $scope.altContentHasBothSidebars;

			// some scene templates let you specify showCurrent for one or more columns; others do it automatically (that will be in the template)
			$scope.showCurrent = ($.inArray("showCurrent", $scope.scene.layouts) > -1);

			// Precalculate each fg, bg, and content pane on scene creation for performance.
			$scope.contentItems = $filter("isContent")($scope.scene.items);
			$scope.mainFgItems = $filter("itemLayout")($scope.scene.items, "mainFg");
			$scope.mainBgItems = $filter("itemLayout")($scope.scene.items, "mainBg");
			$scope.altFgItems = $filter("itemLayout")($scope.scene.items, "altFg");
			$scope.altBgItems = $filter("itemLayout")($scope.scene.items, "altBg");

			// Content is a little trickier:
			// * splitRequired:
			//   main = transcript + optional   / alt=required - transcript
			// * splitOptional:
			//   main=transcript + required / alt=optional - transcript
			// * splitTransmedia (default):
			//   main=annotation except text-transmedia or text-definition, alt=inverse

			// (Note splitRequired and splitOptional are legacy)

			// Main content pane:
			if ($.inArray("splitRequired", $scope.scene.layouts) > -1) {
				$scope.mainContentItems = $filter("transcriptandoptional")($scope.contentItems);
			} else if ($.inArray("splitOptional", $scope.scene.layouts) > -1) {
				$scope.mainContentItems = $filter("transcriptandrequired")($scope.contentItems);
			} else {
				$scope.mainContentItems = $filter("annotation")($scope.contentItems);
			}

			// alt content pane is inverse of main:
			if ($.inArray("splitRequired", $scope.scene.layouts) > -1) {
				$scope.altContentItems = $filter("required")($scope.contentItems);
			} else if ($.inArray("splitOptional", $scope.scene.layouts) > -1) {
				$scope.altContentItems = $filter("optional")($scope.contentItems);
			} else {
				$scope.altContentItems = $filter("transmedia")($scope.contentItems);
			}

			// Check for left and right sidebars
			for (var i = 0; i < $scope.mainContentItems.length; i++) {
				if ($.inArray("burstL", $scope.mainContentItems[i].layouts) > -1 ||
					$.inArray("sidebarL", $scope.mainContentItems[i].layouts) > -1 ||
					$.inArray("burst", $scope.mainContentItems[i].layouts) > -1) {
					$scope.mainContentHasLeftSidebar = true;
				}
				if ($.inArray("burstR", $scope.mainContentItems[i].layouts) > -1 ||
					$.inArray("sidebarR", $scope.mainContentItems[i].layouts) > -1 ||
					$.inArray("burst", $scope.mainContentItems[i].layouts) > -1) {
					$scope.mainContentHasRightSidebar = true;
				}
				if ($scope.mainContentHasLeftSidebar && $scope.mainContentHasRightSidebar) {
					$scope.mainContentHasBothSidebars = true;
					i = $scope.mainContentItems.length; // no need to keep checking the rest
				}
			}

			for (i = 0; i < $scope.altContentItems.length; i++) {
				if ($.inArray("burstL", $scope.altContentItems[i].layouts) > -1 ||
					$.inArray("sidebarL", $scope.altContentItems[i].layouts) > -1 ||
					$.inArray("burst", $scope.altContentItems[i].layouts) > -1) {
					$scope.altContentHasLeftSidebar = true;
				}
				if ($.inArray("burstR", $scope.altContentItems[i].layouts) > -1 ||
					$.inArray("sidebarR", $scope.altContentItems[i].layouts) > -1 ||
					$.inArray("burst", $scope.altContentItems[i].layouts) > -1) {
					$scope.altContentHasRightSidebar = true;
				}
				if ($scope.altContentHasLeftSidebar && $scope.altContentHasRightSidebar) {
					$scope.altContentHasBothSidebars = true;
					i = $scope.altContentItems.length; // no need to keep checking the rest
				}
			}
		};

		function byPullquoteOrH2(item) {
			var isPullQuote = item.templateUrl === 'templates/item/pullquote.html';
			var isPullQuoteAttrib = item.templateUrl === 'templates/item/pullquote-noattrib.html';
			var isH2 = item.templateUrl === 'templates/item/text-h2.html';
			return (isPullQuote || isH2 || isPullQuoteAttrib) ? item : false;
		}

	});
