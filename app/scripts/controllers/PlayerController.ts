//TODO Some of this could be split into separate controllers (though that may not confer any advantage other than keeping this file small...)

import {IModelSvc, IDataSvc} from '../interfaces';
PlayerController.$inject = ['$scope', '$location', '$rootScope', '$routeParams', '$timeout', '$interval', 'config', 'appState', 'dataSvc', 'modelSvc', 'timelineSvc', 'analyticsSvc', 'authSvc', 'selectService', 'playbackService'];

export default function PlayerController($scope, $location, $rootScope, $routeParams, $timeout, $interval, config, appState, dataSvc: IDataSvc, modelSvc: IModelSvc, timelineSvc, analyticsSvc, authSvc, selectService, playbackService) {
  // console.log("playerController", $scope);

  $scope.viewMode = function (newMode) {
    appState.viewMode = newMode;
    analyticsSvc.captureEpisodeActivity("modeChange", {
      "mode": newMode
    });

    appState.producerEditLayer = 0;

    if (newMode === 'review') {
      // magnet animation looks too choppy when loading review mode; skip it:
      $timeout(function () {
        $rootScope.$emit('magnet.jumpToMagnet');
      });
      appState.autoscroll = true;
      appState.autoscrollBlocked = false;
      startScrollWatcher();
      $timeout(handleAutoscroll); // timeout is for edge case where user loads review mode first, before handleAutoscroll is defined below...
    } else {
      appState.autoscroll = false;
      // appState.autoscrollBlocked = true;
    }

    if (newMode === 'watch') {
      $scope.endSearch();
    }

    $timeout(function () {
      $(window)
        .trigger('resize'); // possible fix for unreproducible-by-me layout issue in review mode
    });
  };

  if ($routeParams.viewMode) {
    $timeout(function () {
      $scope.viewMode($routeParams.viewMode);
    });
  }


  // $scope.changeProducerEditLayer = function (newLayer) {
  // 	appState.producerEditLayer = appState.producerEditLayer + newLayer;
  // 	// I'm sure there's a fancier way to do this but
  // 	if (appState.producerEditLayer === 2) {
  // 		appState.producerEditLayer = 1;
  // 	}
  // 	if (appState.producerEditLayer === -2) {
  // 		appState.producerEditLayer = -1;
  // 	}
  // };

  $scope.toggleProducerPreview = function () {
    appState.product = (appState.product === 'producer') ? 'player' : 'producer';
  };

  /* LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

  if ($routeParams.epId) { // if this is missing we're in a narrative, which will init appstate and episodeID for us
    appState.init();
    appState.episodeId = $routeParams.epId;
  } else {
    $scope.narrativeId = $routeParams.narrativeId;
  }

  if (appState.isFramed) {
    /*
     workaround for when instructure canvas fails to size our iframe correctly
     This will be harmless in other platforms:
     */
    if (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) < 151) {
      window.parent.postMessage(JSON.stringify({
        subject: 'lti.frameResize',
        height: "650px"
      }), '*');
    }
  }

  var wileyNag = function () {
    // HACK design-by-committee TS-829 for framed Wiley episodes.
    // (If localStorage is blocked, default to not showing the overlay to avoid annoying them with repeats.)
    if (!appState.isFramed || (modelSvc.episodes[appState.episodeId].templateUrl.indexOf('wiley') === -1)) {
      return;
    }
    var localStorageAllowed = true;
    try {
      localStorage.setItem("iCanHazStorage", 1);
    } catch (e) {
      localStorageAllowed = false;
    }
    if (localStorageAllowed) {
      localStorage.removeItem("iCanHazStorage");
    }
    if (localStorageAllowed && !(localStorage.getItem("noWileyNag"))) {
      appState.show.wileyNag = true;
      var nagWatch = $scope.$watch(function () {
        return playbackService.getMetaProp('time');
      }, function (n) {
        if (n) {
          appState.show.wileyNag = false;
          nagWatch();
        }
      });
    }
    $scope.noWileyNag = function () {
      appState.show.wileyNag = false;
      localStorage.setItem("noWileyNag", "1");
    };
    // END WILEY HACK
  };

  var getEpisodeWatcher = $rootScope.$on("dataSvc.getEpisode.done", function () {
    // getEpisodeWatcher();
    // Wait until we have both the master asset and the episode's items; update the timeline and current language when found
    appState.lang = ($routeParams.lang) ? $routeParams.lang.toLowerCase() : modelSvc.episodes[appState.episodeId].defaultLanguage;

    //need to set narrative on scope for disable_new_window feature for narratives
    //this used to happen in ittNarrativeTimelineJs, but has been deprecated
    modelSvc.setLanguageStrings();
    wileyNag(); // HACK
    document.title = modelSvc.episodes[appState.episodeId].display_title; // TODO: update this on language change
    // console.log("getEpisode.done fired", modelSvc.episodes[appState.episodeId]);
    // producer needs the episode container:
    dataSvc.getContainer(modelSvc.episodes[appState.episodeId].container_id, appState.episodeId).then(function () {
      if (modelSvc.episodes[appState.episodeId].master_asset_id) {
        // watch for the master asset to exist, so we know duration; then call addEndingScreen and timelineSvc.init.
        // HACK this is a weird place for this.
        var watch = $scope.$watch(function () {
          return modelSvc.assets[modelSvc.episodes[appState.episodeId].master_asset_id];
        }, function (masterAsset) {
          if (masterAsset && Object.keys(masterAsset).length > 1) {
            watch();
            modelSvc.addEndingScreen(appState.episodeId); // needs master asset to exist so we can get duration
            timelineSvc.init(appState.episodeId);
            $scope.loading = false;
          }
        });
      } else {
        // Episode has no master asset
        console.log('episode has no master asset!');
        $scope.loading = false;
        // TODO add help screen for new users. For now, just pop the 'edit episode' pane:
        if (appState.product === 'producer') {
          appState.editEpisode = modelSvc.episodes[appState.episodeId];
          appState.editEpisode.templateOpts = selectService.getTemplates('episode');
        }
        appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
        appState.videoControlsLocked = true;
      }

      if (appState.productLoadedAs === 'producer' && !(authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin'))) {
        // TODO redirect instead?
        appState.product = 'player';
        appState.productLoadedAs = 'player';
      }

    });
  });

  if (modelSvc.episodes[appState.episodeId]) {
    // recycle existing episode data.   TODO: DRY the repeated code below from inside getEpisodeWatcher
    appState.lang = ($routeParams.lang) ? $routeParams.lang.toLowerCase() : modelSvc.episodes[appState.episodeId].defaultLanguage;
    document.title = modelSvc.episodes[appState.episodeId].display_title; // TODO: update this on language change
    if (modelSvc.episodes[appState.episodeId].master_asset_id) {
      timelineSvc.init(appState.episodeId);
    } else {
      // TODO add help screen for new users. For now, just pop the 'edit episode' pane:
      if (appState.product === 'producer') {
        appState.editEpisode = modelSvc.episodes[appState.episodeId];
      }
      appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
      appState.videoControlsLocked = true;
    }
    if (appState.productLoadedAs === 'producer' && !(authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin'))) {
      // TODO redirect instead?
      appState.product = 'player';
      appState.productLoadedAs = 'player';
    }
  } else {
    $scope.loading = true;
    modelSvc.addLandingScreen(appState.episodeId);
    dataSvc.getEpisode(appState.episodeId, appState.episodeSegmentId);
  }

  $scope.appState = appState;
  $scope.playbackService = playbackService;
  $scope.show = appState.show; // yes, slightly redundant, but makes templates a bit easier to read
  $scope.now = new Date();

  // $scope.newWindowUrl = config.apiDataBaseUrl + "/v1/new_window";
  // if (appState.narrativeId) {
  //   $scope.newWindowUrl = $scope.newWindowUrl + "?narrative=" + appState.narrativeId + "&timeline=" + appState.timelineId;
  // } else {
  //   $scope.newWindowUrl = $scope.newWindowUrl + "?episode=" + appState.episodeId;
  // }

  const entityId = appState.narrativeId || appState.episodeId;
  const timelineId = appState.timelineId;
  $scope.newWindowUrl = modelSvc.mainVideoNewWindowUrl(entityId, timelineId, playbackService.getMetaProp('time'));
  $scope.iframeIOSOverlayHandler = iframeIOSOverlayHandler;
  $scope.showIframeIOSOverlay = appState.isIframedIOS();

  function iframeIOSOverlayHandler() {
    window.open($scope.newWindowUrl);
  }
  // put this in template instead
  // if (appState.user.access_token) {
  // 	$scope.newWindowUrl = $scope.newWindowUrl + "&access_token=" + appState.user.access_token;
  // } else {
  // 	// HACK wait for user info to finish loading
  // 	$timeout(function () {
  // 		$scope.newWindowUrl = $scope.newWindowUrl + "&access_token=" + appState.user.access_token;
  // 	}, 500);
  // }

  /* END LOAD EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

  /* BEGIN TOOLBAR HIDE/REVEAL- - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
  // TODO put this in own controller

  // Bottom toolbar starts out hidden.  5s after using a control or leaving the pane, fade out controls.
  //   If mouse re-enters pane, keep the controls visible.

  appState.videoControlsActive = false;
  var controlTimer;
  var keepControls;

  var videoControlsWatcher = $scope.$watch(function () {
    return appState.videoControlsActive;
  }, function (isActive) {
    if (isActive) {
      $timeout.cancel(controlTimer);
      controlTimer = $timeout(function () {
        if (!keepControls) { // <-- this is why we're not just calling allowControlsExit here
          appState.videoControlsActive = false;
        }
      }, 5000);
    }
  });

  $scope.showControls = function () {
    // console.log("showControls");
    $timeout.cancel(controlTimer);
    appState.videoControlsActive = true;
    if (appState.isTouchDevice) {
      $scope.allowControlsExit(); // otherwise it sticks permanently on touchscreens. TODO find a better way
    }
  };

  // $scope.keepControls = function () {
  // 	console.log("keepControls");
  // 	appState.videoControlsLocked = true;
  // };

  $scope.allowControlsExit = function () {
    // console.log("allowControlsExit. Locked state is ", appState.videoControlsLocked);
    // appState.videoControlsLocked = false;
    $timeout.cancel(controlTimer);
    controlTimer = $timeout(function () {
      if (!appState.videoControlsLocked) {
        appState.videoControlsActive = false;
      }
    }, 5000);
  };

  /* END TOOLBAR HIDE/REVEAL- - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

  // Misc toolbars too small to rate their own controllers
  $scope.toggleSearchPanel = function () {
    appState.show.searchPanel = !appState.show.searchPanel;
    console.log('toggle search pane!', appState.show.searchPanel);
    if (appState.windowWidth < 480) {
      $scope.viewMode('review');
    } else {
      $scope.viewMode(appState.show.searchPanel ? 'review' : 'discover');
    }

    appState.searchText = '';
    if (appState.show.searchPanel) {
      $timeout(function () {
        document.getElementById('searchtext').focus();
      });
    }
  };

  $scope.endSearch = function () {
    appState.searchText = '';
    appState.show.searchPanel = false;
  };

  $scope.toggleNavPanel = function () {
    // console.log("toggleNavPanel");
    timelineSvc.pause();
    appState.show.navPanel = !appState.show.navPanel;
  };

  $scope.seek = function (t) {
    // triggered by nav panel
    timelineSvc.seek(t, "sceneMenu");
    appState.show.navPanel = false;
  };

  $scope.pause = function () {
    timelineSvc.pause();
  };

  // Intercepts the first play of the video and decides whether to show the help panel beforehand.
  // Disabling this,since we're not showing a help panel anymore, but keeping it in case we change our minds on that
  var firstplayWatcher = $rootScope.$on("video.firstPlay", function () {
    // if (localStorageAllowed && appState.time === 0 && !(localStorage.getItem("noMoreHelp"))) {
    // 	// appState.show.helpPanel = true;
    // } else {
    timelineSvc.play();
    // }
  });

  $scope.hidePanel = function (panel) {
    // console.log("hidePanel", panel);
    appState.show[panel] = false;
    // console.log(appState);
  };

  $scope.hidePanels = function () {
    // dismiss ALL THE THINGS
    appState.show.navPanel = false;
    appState.show.profilePanel = false;
    appState.itemDetail = false;
    $rootScope.$emit("player.dismissAllPanels");
  };

  $scope.play = function () {
    console.log('PlayerController#play');
    timelineSvc.play();
  };

  $scope.continue = function () {
    // console.log("continue", modelSvc.episodes[appState.episodeId].masterAsset.duration, appState.time);
    // If we're close to the end, jsut move to the ending screen and stop.
    if (modelSvc.episodes[appState.episodeId].masterAsset.duration - playbackService.getMetaProp('time') < 0.2) {
      timelineSvc.pause();
      timelineSvc.seek(modelSvc.episodes[appState.episodeId].masterAsset.duration - 0.01);
    } else {
      timelineSvc.play();
    }
  };

  $scope.userHasRole = authSvc.userHasRole;
  $scope.logout = authSvc.logout;
  $scope.isTrueGuest = authSvc.isTrueGuest;

  // - - - - - - - - -  - - - - - - - - - - - - - - -
  // Autoscroll
  // Some jQuery dependencies here (namespaced bindings, animated scroll)

  // appstate.autoscroll = we are in a mode which wants autoscroll
  // appstate.autoscrollBlocked = user has disabled autoscroll (by scrolling manually)
  // (Those are in modelSvc instead of $scope becuase in future we'll want scenes to be able to autoscroll too)

  // isn't it weird how we read the scrollTop from (window), but have to animate it on (body,html)?

  // NOTE: When we had the #CONTAINER position:fixed hack for fullscreen safari, this needed to be configurable to point to
  // #CONTAINER instead of window.  Have removed that, but leaving this here in case we bring it back:

  //console.log("AppState scroll stuff", "scroll:", appState.autoscroll, "blocked:", appState.autoscrollBlocked, appState.isTouchDevice);

  if (appState.isTouchDevice && appState.viewMode === 'review') {
    appState.autoscroll = true;
  }

  var autoscrollableNode = $(window);
  var animatableScrollNode = $('html,body');
  var autoscrollTimer = false;

  var startScrollWatcher = function () {
    //console.log("startScrollWatcher");
    if (autoscrollTimer) {
      return;
    }
    autoscrollTimer = $interval(handleAutoscroll, 400);
    autoscrollableNode.bind("scroll", function () {
      // User-initiated scrolling should block autoscroll.
      // console.log("user scrolled");
      animatableScrollNode.stop();
      stopScrollWatcher();
      appState.autoscrollBlocked = true;
    });
    // handleAutoscroll();
  };

  var stopScrollWatcher = function () {
    console.log("stopScrollWatcher");
    autoscrollableNode.unbind("scroll");
    $interval.cancel(autoscrollTimer);
    autoscrollTimer = false;

  };

  $scope.enableAutoscroll = function () {
    // console.log("Enabling autoscroll");
    if (appState.autoscrollBlocked) {
      appState.autoscrollBlocked = false;
      startScrollWatcher();
    }
  };

  // TODO this is a relatively expensive watch.  Could greatly increase its $interval if we
  // support directly triggering it from timeline on seek()...
  var handleAutoscroll = function () {
    //console.log("handleAutoscroll", "scroll:", appState.autoscroll, "blocked:", appState.autoscrollBlocked);
    // if autoscroll is true and autoscrollBlocked is false,
    // find the topmost visible current item and scroll to put it in the viewport.
    // WARNING this may break if item is inside scrollable elements other than #CONTAINER
    if (appState.autoscrollBlocked || !appState.autoscroll) {
      return;
    }

    // find topmost visible current items.
    // Limiting search to .reviewMode for now, because it was matching and trying to scroll to modals;
    // when we add more generalized autoscroll support within scenes that will need to change of course
    var top = Infinity;
    var curScroll = autoscrollableNode.scrollTop();

    // HACK. Need to limit this to search within a pane
    angular.forEach($('.isCurrent:visible'), function (item) {
      var t = item.getBoundingClientRect()
          .top + curScroll;
      if (t < top) {
        top = t;
      }
    });
    if (top === Infinity) {
      return;
    }

    // There's a visible current item; is it within the viewport?
    var slop = 180;
    if (
      (top > curScroll + slop) && // below top of viewport
      ((top - curScroll) < (document.documentElement.clientHeight - slop)) // above bottom of viewport
    ) {
      return;
    }
    if (top < slop && curScroll < slop) {
      return; // too close to top of window to bother
    }

    // Okay, we got past all those returns; it must be time to scroll
    // console.log("handleAutoscroll triggering a scroll");
    stopScrollWatcher();
    animatableScrollNode.animate({
      "scrollTop": top - slop
    }, 1500);

    // Don't use jQuery's animation callback; this would get called twice because animatableScrollNode is two nodes...
    $timeout(function () {
      startScrollWatcher();
    }, 1750); // allow extra time; iPad was still capturing the tail end of the animated scroll

  };

  startScrollWatcher();

  // - - - - - - - - -  - - - - - - - - - - - - - - -

  var escWatcher = $rootScope.$on("userKeypress.ESC", $scope.hidePanels);

  $scope.$on('$destroy', function () {
    videoControlsWatcher();
    getEpisodeWatcher();
    firstplayWatcher();
    escWatcher();
  });
}
