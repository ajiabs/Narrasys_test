'use strict';

angular.module('com.inthetelling.player')
	.factory('youtubeSvc', function ($window, $document) {
		console.log('youtubeSvc factory');
		var svc = {};

		var apiTag = document.createElement('script');
		apiTag.src = "//www.youtube.com/iframe_api";
		angular.element($document[0].head).append(apiTag);
		$window.onYouTubeIframeAPIReady = function () {
			svc.youtubeIsReady = true;
			console.log("Youtube Service ready");
		};

		svc.players = [];

		svc.createPlayer = function (node) {
			if (svc.youtubeIsReady) {
				console.log("youtubeSvc.createPlayer", node);
				if (!svc.players[node.id]) {
					var player = new YT.Player(node.id, {
						events: {
							'onStateChange': function (x) {
								console.log("yt player state change:", x);
							}
						}
					});
					svc.players[node.id] = player;
				}
				return svc.players[node.id];
			} else {
				console.error("Youtube API not ready"); // TODO
			}

		};

		return svc;
	});
