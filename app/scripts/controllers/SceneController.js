'use strict';

angular.module('com.inthetelling.story')
	.controller('SceneController', function ($scope, $filter, $log, demoService, appState, modelSvc, demoMock) {

		$scope.byPullquoteOrH2 = byPullquoteOrH2;
		$scope.selectLayout = selectLayout;
		$scope.imageSwap = imageSwap;
		$scope.pdfSwap = pdfSwap;
		$scope.pqSwap = pqSwap;
		$scope.videoSwap = videoSwap;
		$scope.sideBarClick = sideBarClick;
		$scope.toggleSideBar = toggleSideBar;
		$scope.show = false;

		$scope.demo = demoService;
		$scope.$log = $log;
		$scope.episode = modelSvc.episodes[appState.episodeId];

		appState.currentSceneTemplate = {path: $scope.scene.templateUrl, style: ''};

		$scope.$watch(function() {
			return appState.currentSceneTemplate;
		}, function(nv, ov) {
			if (nv !== ov) {
				console.log('scene tmpl change', nv);
				$scope.scene.templateUrl = nv.path;
				$scope.scene.styleCss = nv.style;
				//set the first scene to use the template selected
				//from sidebar
				var firstScene = modelSvc.events['572920395c92ebb2590000df'];
				firstScene.templateUrl = nv.path;
				firstScene.styleCss = nv.style;
			}
		}, true);

		function _addPqTest() {
			var pq = demoMock.addStubPq();
			$scope.mainContentItems = [pq];
			modelSvc.events['572920395c92ebb2590000df'].items.push(pq);
		}

		function pqSwap(e) {
			//console.log("ev in ctrl", e);
			_addPqTest();
			console.log(e);
			e.currentTarget.remove();
			$scope.demo.replacePq();
		}

		function toggleSideBar() {
			$scope.demo.selectLayout();
		}

		function selectLayout(l) {
			//$scope.demo.selectLayout();
			$scope.scene.templateUrl = l.templateUrl;

		}

		function sideBarClick() {
			console.log('wired up!');
			$scope.show = !$scope.show;
			$scope.demo.selectLayout();
		}

		function imageSwap(fileList) {
			console.log('img swap wired up!!', fileList);
			demoMock.imageAsset(fileList).then(function(img) {
				$scope.altContentItems.push(img);
				modelSvc.events['572920395c92ebb2590000df'].items.push(img);
				$scope.demo.replaceImage();
			});
		}

		function pdfSwap(fileList) {
			demoMock.pdfAsset(fileList).then(function(newPdf) {
				$scope.altContentItems.push(newPdf);
				$scope.demo.replacePdf();
				modelSvc.events['572920395c92ebb2590000df'].items.push(newPdf);
				//console.log('scene items', modelSvc.events['572920395c92ebb2590000df'].items);
			});

		}

		function videoSwap(fileList) {
			//console.log('video on scope?', $scope);

			var currentMain = modelSvc.assets['572923f15c92eb00cf000110'];
			demoMock.videoAsset(fileList).then(function(newVideo) {
				currentMain.url = newVideo.url;
				currentMain.urls.mp4.push(newVideo.url);
				$scope.demo.replaceVideo();
			});
		}

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
