// Minor jquery dependency ($.inArray)


import { IEpisode, IEvent, IScene } from '../models';

const TEMPLATE = `<span ng-include="$ctrl.scene.templateUrl"></span>'`;

interface ISceneBindings extends ng.IComponentController {
  scene: IScene;
  episode: IEpisode;
}

class SceneController implements ISceneBindings {
  scene: IScene;
  episode: IEpisode;
  mainContentHasLeftSidebar: boolean;
  mainContentHasRightSidebar: boolean;
  mainContentHasBothSidebars: boolean;
  altContentHasLeftSidebar: boolean;
  altContentHasRightSidebar: boolean;
  altContentHasBothSidebars: boolean;
  contentItems: IEvent[];
  mainFgItems: IEvent[];
  mainBgItems: IEvent[];
  mainContentItems: IEvent[];
  altContentItems: IEvent[];
  showCurrent: boolean;
  static $inject = ['$filter', 'appState'];
  constructor(private $filter: ng.IFilterService, private appState) {
    //
  }

  $onInit() {
    //
  }

  setBgImgUrl() {

  }

  precalculateSceneValues() {

  }


}


export class Scene implements ng.IComponentOptions {
  bindings: any = {
    scene: '<',
    episode: '<'
  };
  template: string = TEMPLATE;
  controller = SceneController;
  static Name: string = 'npScene'; // tslint:disable-line
}


ittScene.$inject = ['$interval', 'appState'];

export default function ittScene($interval, appState) {
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

      var twiddleScene = function () {
        var magnetNode = element.find('.videoMagnet img');
        if (magnetNode.height() === null) {
          // console.warn("twiddleScene called with no visible video magnet; waiting.");
          var unwatchMagnet = scope.$watch(function () {
            // Don't try to optimize by using magnetNode from above; if we got here in the first place magnetNode is undefined.
            // This is an expensive $watch but will only run for a tick or two while the scene is being drawn...
            return element.find('.videoMagnet img').height();
          }, function (newH) {
            if (newH > 0) {
              unwatchMagnet();
              twiddleScene();
            }
          });
        } else {
          element.find('.matchVideoHeight:visible').each(function () {
            $(this).css("height", element.find('.videoMagnet img').height());
          });
          var availableViewportHeight = angular.element(window).height() - $('#CONTAINER').scrollTop();
          /* TOOLBAR HEIGHT */
          element.find('.stretchToViewport:visible').each(function () {
            $(this).css("min-height", (availableViewportHeight - $(this).offset().top));
          });
          // landing screen: keep the bottom toolbar onscreen
          element.find('.stretchToViewportShort:visible').each(function () {
            $(this).css("min-height", (availableViewportHeight - $(this).offset().top - 210)); // HARDCODED FOOTER HEIGHT
          });
        }

        element.find('.content').each(function () {
          var contentpane = $(this);
          if (contentpane.outerWidth() > 550) {
            contentpane.addClass('allowSidebars');
          } else {
            contentpane.removeClass('allowSidebars');
          }
        });
      };

      // Trigger twiddleScene when the window changes size, the scene becomes current, or the viewMode changes:
      scope.unwatch = scope.$watch(function () {
        return {
          winWidth: appState.windowWidth,
          winHeight: appState.windowHeight,
          newMode: appState.viewMode
        };
      }, function (the) {
        if (the.newMode === 'discover' && scope.scene.isCurrent) {
          twiddleScene();
        }
      }, true);

      // trigger init when the user edits content:
      scope.unwatchEdits = scope.$watch(function () {
        return appState.editEvent;
      }, scope.precalculateSceneValues, true);

      // HACK to catch cases (mostly on ios) where matchvideoheight isn't matching.
      // slow, odd interval
      scope.safetyBelt = $interval(twiddleScene, 1321);

      // cleanup watchers on destroy
      scope.$on('$destroy', function () {
        scope.unwatch();
        scope.unwatchEdits();
        $interval.cancel(scope.safetyBelt);
      });

    },

  };
}
