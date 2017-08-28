// Minor jquery dependency ($.inArray)
ittScene.$inject = ['$timeout', 'appState'];

export default function ittScene($timeout, appState) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      scene: '=ittScene',
      episode: '=episode'
    },
    template: '<span ng-include="scene.templateUrl"></span>',
    controller: 'SceneController',
    link: function (scope, element) {
      // console.log('ittScene', scope, element, attrs);

      // force discover and watch modes to not start out scrolled halfway out of view (STORY-161)
      if (appState.viewMode !== 'review') {
        window.scrollTo(0, 0);
      }
      scope.precalculateSceneValues();
      scope.appState = appState;

      // Trigger twiddleScene when the window changes size, the scene becomes current, or the viewMode changes:
      if (!isIOS()) {
        window.addEventListener('resize', () => twiddleScene());
      }
      twiddleScene();

      //BEGIN temp code for debugging purposes
      // setCurrentSeneNameOnAppState();
      // function _getSceneName(sceneTemplate) {
      // 	var _scenes = {
      // 		centered: 'templates/scene/centered.html',
      // 		centeredPro: 'templates/scene/centeredPro.html',
      // 		'1col': 'templates/scene/1col.html',
      // 		'2colL': 'templates/scene/2colL.html',
      // 		'2colR': 'templates/scene/2colR.html',
      // 		mirroredTwoCol: 'templates/scene/mirrored-twocol.html',
      // 		cornerV: 'templates/scene/cornerV.html',
      // 		centerVV: 'templates/scene/centerVV.html',
      // 		centerVVMondrian: 'templates/scene/centerVV-Mondrian.html',
      // 		cornerH: 'templates/scene/cornerH.html',
      // 		pip: 'templates/scene/pip.html'
      // 	};
      //
      // 	return Object.keys(_scenes).filter(function (key) {
      // 		return _scenes[key] === sceneTemplate;
      // 	})[0];
      // }
      //
      // function setCurrentSeneNameOnAppState() {
      // 	if (scope.scene) {
      // 		appState.currSceneName = scope.scene.templateUrl;
      // 		// appState.sceneLayouts = scope.scene.layouts;
      // 	}
      // }
      //END temp code for debugging purposes

      // if (scope.scene._id.match(/internal/)) {
      // landing and ending screens get inter-episode nav:
      // scope.containers = modelSvc.containers;
      // scope.crossEpisodePath = appState.crossEpisodePath;
      // }

      function isIOS(): boolean {
        return (appState.iOSVersion && appState.iOSVersion[0] && appState.iOSVersion[0] > 0);
      }


      function twiddleScene() {
        if (isIOS()) {
          return;
        }
        $timeout(
          () => {
            element.find('.matchVideoHeight:visible').each(function () {
              $(this).css('height', element.find('.videoMagnet img').height());
            });
            const availableViewportHeight = angular.element(window).height() - $('#CONTAINER').scrollTop();
            /* TOOLBAR HEIGHT */
            element.find('.stretchToViewport:visible').each(function () {
              $(this).css('min-height', (availableViewportHeight - $(this).offset().top));
            });
            // landing screen: keep the bottom toolbar onscreen
            element.find('.stretchToViewportShort:visible').each(function () {
              // HARDCODED FOOTER HEIGHT
              $(this).css('min-height', (availableViewportHeight - $(this).offset().top - 210));
            });
          },
          100
        );
      }

      // trigger init when the user edits content:
      scope.unwatchEdits = scope.$watch(
        () => appState.editEvent,
        scope.precalculateSceneValues,
        true
      );

      // HACK to catch cases (mostly on ios) where matchvideoheight isn't matching.
      // slow, odd interval
      // scope.safetyBelt = $interval(twiddleScene, 1321);

      // cleanup watchers on destroy
      scope.$on('$destroy', () => {
        // scope.unwatch();
        scope.unwatchEdits();
        // $interval.cancel(scope.safetyBelt);
      });
    }
  };
}
