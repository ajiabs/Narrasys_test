'use strict';

/* Quick way to check which templates are actually being used */


angular.module('com.inthetelling.player')
  .controller('Inventory', function ($scope, dataSvc, $timeout, modelFactory) {

    console.log('inventory', $scope);

    $scope.episodes = [];

    $scope.sum = {
      "templates/episode-default.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/episode-eliterate.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/episode-ewb.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/episode-tellingstory.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-1col.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-2colL.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-2colR.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-animatetest.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-centered.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-cornerH.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-cornerV.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-explore.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/scene-video.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/text-h1.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/text-h2.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/text-pullquote-noattrib.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/text-pullquote.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transcript-closedcaption.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transcript-default.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transcript-withthumbnail-alt.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transcript-withthumbnail.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-caption.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-embed-youtube.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-image-default.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-image-fill.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-image-plain.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-link-default.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-link-frameicide.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-link-icon.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-link-noembed.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-link-youtube.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-linkonly.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-slidingcaption.html": {
        count: 0,
        layout: [],
        styles: []
      },
      "templates/transmedia-thumbnail.html": {
        count: 0,
        layout: [],
        styles: []
      }
    };

    var capture = function (eMod) {
      if (!$scope.sum[eMod.templateUrl]) {
        console.warn("Unknown template!", eMod.templateUrl);
      } else {
        $scope.sum[eMod.templateUrl].count++;
        if (eMod.layout !== '') {
          $scope.sum[eMod.templateUrl].layout.push(eMod.layout);
        }
        if (eMod.styles !== '') {
          $scope.sum[eMod.templateUrl].styles.push(eMod.styles);
        }
      }
    };

    var getEpisodeData = function (epId) {
      /*
			dataSvc.get({'epId': epId},function(data) {
				$scope.episodes.push(data);
				console.log($scope.episodes.length);
			}, function(data) {
				console.log("FAIL",data);
			});
*/
      dataSvc.get({
        'epId': epId
      }, function (data) {
        console.log(data);
        data.scenes = [];
        data.items = [];
        data.episode = modelFactory.createEpisodeModel(data.episode);
        console.log(data.episode);
        capture(data.episode);

        for (var i = 0; i < data.events.length; i++) {
          var e = data.events[i];
          var eMod;
          if (e.type === "scene") {
            eMod = modelFactory.createSceneModel(e);
            data.scenes.push(eMod);
          } else {
            eMod = modelFactory.createItemModel(e);
            data.items.push(eMod);
          }
          capture(eMod);
        }

        console.log($scope.sum);
        $scope.episodes.push(data);
      });

    };

    $scope.episodeIDs = [
      /*
Don't kill the database server, uncomment this only when you really need to

			"52e6eb92c9b71585ce000042",
			"52e6eb9ac9b71585ce000044",
			"52e6eb9fc9b71585ce000046",
			"52e6eba2c9b71585ce000048",
			"52e6eba6c9b71585ce00004a",
			"52e6ebadc9b71585ce00004c",
			"52fbdd23c9b715c719000003",
			"52e2f891c9b71559a3000002",
			"52e68d5ac9b71523ee000002",
			"52e1632ac9b715b6d3000007",
			"52e2b151c9b7159943000035",
			"52e68d61c9b71523ee000004",
			"52e68d68c9b71523ee000006",
			"52fab129c9b7153dce000008"
			*/
    ];
    for (var i = 0; i < $scope.episodeIDs.length; i++) {
      (function (i) {
        $timeout(function () {
          getEpisodeData($scope.episodeIDs[i]);
        }, 2000 * i);
      })(i);
    }


  });
