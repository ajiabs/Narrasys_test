'use strict';

angular.module('com.inthetelling.story')
	.controller('SceneController', function ($scope, $filter, ittUtils) {
		$scope.byPullquoteOrH2 = byPullquoteOrH2;
		$scope.setBgImgUrl = setBgImgUrl;
		$scope.precalculateSceneValues = precalculateSceneValues;

		function precalculateSceneValues() {
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
		}

		function byPullquoteOrH2(item) {
			var isPullQuote = item.templateUrl === 'templates/item/pullquote.html';
			var isPullQuoteAttrib = item.templateUrl === 'templates/item/pullquote-noattrib.html';
			var isH2 = item.templateUrl === 'templates/item/text-h2.html';
			return (isPullQuote || isH2 || isPullQuoteAttrib) ? item : false;
		}

		function setBgImgUrl(items, col) {
			var currItems = $filter('isCurrent')(items);
			var mainColBgOrFg = $filter(col)(currItems);
			var opacity = 1;
			var bgSize;
			if (mainColBgOrFg.length > 0 && ittUtils.existy(mainColBgOrFg[0].asset)) {
				var bgUrl = 'url('+ mainColBgOrFg[0].asset.url +')';
				if (/Bg/.test(mainColBgOrFg[0].layoutCss)) {
					opacity = 0.25;
				}
				var coverOrContain = mainColBgOrFg[0].styleCss.match(/cover|contain/);

				if (coverOrContain) {
					bgSize = coverOrContain[0];
				}

				return { 'background-image': bgUrl, 'background-size': bgSize, 'opacity': opacity  };
			}
			return '';
		}
	});
