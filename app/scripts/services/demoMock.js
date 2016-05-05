/**
 * Created by githop on 4/28/16.
 */


(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('demoMock', demoMock);

	function demoMock($q, modelSvc, ittUtils, appState, stubData) {


		return {
			addStubPq: addStubPq,
			landingScreenSceneItems: _landingScreenSceneItems,
			videoAsset: videoAsset,
			imageAsset: imageAsset
		};

		function _landingScreenSceneItems() {

			var _landingScreenId = Object.keys(modelSvc.events).filter(function (scenes) {
				return scenes.indexOf('landingscreen') > -1;
			});

			return modelSvc.scene(_landingScreenId).items;
		}

		function addStubPq() {
			//_landingScreenSceneItems().push(_stubPQ);
			//modelSvc.cache('event', _stubPQ);
			//modelSvc.resolveEpisodeEvents('572142e65c92ebacb8000175');
			//console.log(_landingScreenSceneItems());
			//timelineSvc.updateEventTimes(modelSvc.events[data._id]);
			return stubData.stubPq;
		}

		function _readFile(files) {
			var _reader = new FileReader();
			//var _img = new Image();
			return $q(function (resolve, reject) {
				_reader.onloadend = function () {
					console.log('onloadend fileReader!!');
					resolve(_reader.result);
				};
				_reader.onerror = function () {
					console.log('FIleReader Err', _reader.error);
					reject(_reader.error);
				};
				_reader.readAsDataURL(files[0]);
			});
		}

		function imageAsset(files) {
			return _readFile(files).then(function (url) {
				var stub = {
					"_id": "stubImg",
					"_type": "Asset::Image",
					"user_id": "52e6c766c9b715e92b000001",
					"name": {"en": files[0].name},
					"content_type": files[0].type,
					"size": files[0].size,
					"description": {},
					"url": url
				};
				modelSvc.cache("asset", stubData.stubImg);
				stubData.stubImg.asset = stub;
				return stubData.stubImg;
			});
		}

		function videoAsset(files) {
			return function (scope) {
				_readFile(files).then(function (url) {
					var stub = {
						'_id': ittUtils.generateUUID(),
						'type': 'Asset::Video',
						'_type': 'Asset::Video',
						'user_id': appState.user._id,
						'url': url,
						'alternate_urls': [url],
						'name': {en: files[0].name},
						'content_type': files[0].type,
						'size': files[0].size,
						'original_filename': files[0].name,
						'duration': 37,
						'description': {}
					};
					console.log('videoStub', stub);
					modelSvc.cache("asset", stub);
					scope.callback(stub._id);
				});
			};
		}
	}


})();
