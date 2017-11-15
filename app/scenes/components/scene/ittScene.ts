// @npUpgrade-scene-false
// Minor jquery dependency ($.inArray)
import { tmpSceneMap } from '../../scenes.module';
import { IDynamicTemplateService } from '../../../interfaces';

ittScene.$inject = ['$timeout', 'appState'];


export default function ittScene($timeout, appState) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      scene: '=ittScene',
      episode: '=episode'
    },
    template: '<span np-dynamic-event-template component-name="{{scene.component_name}}"></span>',
    // template: '<span ng-include="scene.templateUrl"></span>',
    controller: 'SceneController',
    link: function (scope, element) {
      // force discover and watch modes to not start out scrolled halfway out of view (STORY-161)
      if (appState.viewMode !== 'review') {
        window.scrollTo(0, 0);
      }
      scope.precalculateSceneValues();
      scope.appState = appState;

      // Trigger twiddleScene when the window changes size, the scene becomes current, or the viewMode changes:
      window.addEventListener('resize', () => twiddleScene());
      twiddleScene();

      function twiddleScene() {
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
