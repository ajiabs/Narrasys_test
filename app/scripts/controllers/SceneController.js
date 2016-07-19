'use strict';

angular.module('com.inthetelling.story')
	.controller('SceneController', function ($scope, $filter) {

		$scope.byPullquoteOrH2 = byPullquoteOrH2;
		$scope.setBgImgUrl = setBgImgUrl;
		// $scope.setBgAltImgUrl = setBgAltImgUrl;

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

		var _cssBackground = 'background-image';
		var _cssOpacity = 'opacity';

		function setBgImgUrl(items, col) {
			var currItems = $filter('isCurrent')(items);
			var mainColBgOrFg = $filter(col)(currItems);
			var opacity = 1;
			if (mainColBgOrFg.length > 0) {

				var bgUrl = 'url('+ mainColBgOrFg[0].asset.url +')';

				if (/Bg/.test(mainColBgOrFg[0].layoutCss)) {
					opacity = 0.33;
				}
				return {[_cssBackground]: bgUrl, [_cssOpacity]: opacity};
			}
			return '';
		}

		function setBgAltImgUrl(items) {
			// console.trace('hmm');
			// var bgItem = $filter('isCurrent')(items);
            //
			// if (bgItem.length > 0) {
			// 	console.log('bgItem', bgItem[0].layoutCss);
			// 	return 'url('+bgItem[0].asset.url+')';
			// }
			// return '';
		}

		function backgroundImage(items) {
			var currentItems = $filter('isCurrent')(items);

		}

		//determine if main/alt, then bg/fg
		//

		// function setBgImgUrl(items) {
        //
		// 	// var bgItems = $filter('isCurrent')(items);
        //
		// 	// var mFgItem = $filter('itemLayout')(bgItems, 'mainFg');
		// 	// var mBgItem = $filter('itemLayout')(bgItems, 'mainBg');
		// 	// var aFgItem = $filter('itemLayout')(bgItems, 'altFg');
		// 	// var aBgItem = $filter('itemLayout')(bgItems, 'altBg');
        //
        //
		// 	var currentItems = $filter('isCurrent')(items);
        //
		// 	var bgItems = $filter('itemLayout')(currentItems);
        //
		// 	console.log('bgItems', bgItems);
        //
		// 	if (bgItems.length > 0) {
		// 		var bgKey = 'background-image';
		// 		var bgProp = 'url(' + bgItems[0].asset.url + ')';
		// 		var opKey = 'opacity:';
		// 		var opProp = '1';
		// 		// console.log('bgItems', bgItems[0].layoutCss);
		// 		// var isAlt = /altBg/.test(bgItems[0].layoutCss);
		// 		var bgObj = {[bgKey]: bgProp};
		// 		var opObj = {[opKey]: opProp};
		// 		// if (isAlt) {
		// 		// 	opProp = '0.33';
		// 		// }
		// 		// console.log('item', bgItems[0].title.en);
		// 		// console.log('layoutCss',bgItems[0].layoutCss);
		// 		var cssObj = angular.extend({}, bgObj, opObj);
		// 		// console.log('cssObj', cssObj);
		// 		return cssObj
        //
		// 	}
		// 	return '';
		// }

		// function setBgImgUrl(items) {
		// 	var currentItems = $filter('isCurrent')(items);
		// 	// var mainBg = $filter('itemLayout')(bgItems, 'mainBg');
		// 	// var mainFg = $filter('itemLayout')(bgItems, 'mainFg')
		// 	var bgItems = $filter('bgItems')(currentItems);
		// 	var cssBackground = 'background-image';
		// 	var cssOpacity = 'opacity';
		// 	var backgroundVal;
		// 	var opacityVal = 1;
        //
		// 	var mainBg = bgItems('mainBg');
		// 	var mainFg = bgItems('mainFg');
        //
		// 	var altBg = bgItems('altBg');
		// 	var altFg = bgItems('altFg');
        //
		// 	console.log('mainBg', mainBg, 'altBg', altBg);
		// 	// if (bgItems.length > 0) {
		// 	// 	bgItems.forEach(function(item) {
		// 	// 		backgroundVal = 'url('+ item.asset.url +') ';
		// 	// 		//set opacity to 0.33
		// 	// 		if (item.layoutCss === 'altBg' || item.layoutCss === 'mainBg') {
		// 	// 			console.log(item.layoutCss);
		// 	// 			opacityVal = 0.33;
		// 	// 		}
         //    //
		// 	// 		return {[cssBackground]: backgroundVal, [cssOpacity]: opacityVal};
		// 	// 	});
		// 	// }
        //
		// }

	});
