'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeController', function ($scope) {


		var uABgs = [
			{img: 'UofA_Fullscreen_BG_Square_Trans.svg', name: 'UofA_Fullscreen_BG_Square_Trans'},
			{img: 'UofA_Fullscreen_BG_Square.svg', name: 'UofA_Fullscreen_BG_Square'},
			{img: 'UofA_Fullscreen_BG_Trans.svg', name: 'UofA_Fullscreen_BG_Trans'}
		];


		$scope.episodeBg = null;
		$scope.currentImg = null;
		$scope.uaBgs = uABgs;

		var pathPrefix = '/images/customer/';

		$scope.swapBgImage = swapBgImage;
		function swapBgImage(bg) {
			$scope.currentImg = bg.name;
			$scope.episodeBg = {'background-image': 'url(' +pathPrefix + bg.img + ')' };
		}
	});
