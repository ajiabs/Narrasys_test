///**
// * Created by githop on 1/6/16.
// */
//
//(function() {
//	'use strict';
//
//	describe('Service: YoutubePlayerManager', function() {
//
//		beforeEach(module('com.inthetelling.story'));
//
//		var youTubePlayerManager;
//		var youtubePlayerCreator;
//
//		beforeEach(inject(function(_youTubePlayerManager_, _youtubePlayerCreator_) {
//			youTubePlayerManager = _youTubePlayerManager_;
//			youtubePlayerCreator = _youtubePlayerCreator_;
//			var ytPlayerSpy = jasmine.createSpyObj('ytPlayerSpy', ['loadVideoById', 'playVideo', 'pauseVideo']);
//			spyOn(youtubePlayerCreator, 'createPlayer').and.returnValue(ytPlayerSpy);
//			youTubePlayerManager.create();
//		}));
//
//		it('should be a thing', function() {
//
//
//		});
//	});
//})();
