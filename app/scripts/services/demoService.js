/**
 * Created by githop on 4/29/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('demoService', demoService);

	function demoService($routeParams) {
		var _layoutSelected = false;
		var _videoReplaced = false;
		var _imageSelected = false;
		var _pdfReplaced = false;
		var _pqReplaced = false;

		return {
			layoutSelected: layoutSelected,
			videoReplaced: videoReplaced,
			selectLayout: selectLayout,
			replaceVideo: replaceVideo,
			isDemo: isDemo,
			imageReplaced: imageReplaced,
			replaceImage: replaceImage,
			pdfReplaced: pdfReplaced,
			replacePdf: replacePdf,
			pqReplaced: pqReplaced,
			replacePq: replacePq
		};

		function videoReplaced() {
			return _videoReplaced;
		}

		function replaceVideo() {
			_videoReplaced = true;
		}

		function layoutSelected() {
			return _layoutSelected;
		}

		function selectLayout() {
			_layoutSelected = !_layoutSelected;
		}

		function imageReplaced() {
			return _imageSelected;
		}

		function replaceImage() {
			_imageSelected = true;
		}

		function pdfReplaced() {
			return _pdfReplaced;
		}

		function replacePdf() {
			_pdfReplaced = true;
		}

		function pqReplaced() {
			return _pqReplaced;
		}

		function replacePq() {
			_pqReplaced = true;
		}


		function isDemo() {
			if ($routeParams.demo === '1') {
				return true;
			} else if ($routeParams.demo === '0') {
				return false;
			}
		}

	}


})();
