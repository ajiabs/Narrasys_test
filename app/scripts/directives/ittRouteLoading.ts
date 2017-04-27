/**
 * Created by githop on 6/15/16.
 */
export default function ittRouteLoading() {
  return {
    restrict: 'EA',
    template: [
      '<div ng-if="routeLoadingCtrl.isLoading" class="loading routeLoading">',
      '	<div class="spinner">',
      '		<div class="rotating pie"></div>',
      '		<div class="filler pie"></div>',
      '		<div class="mask"></div>',
      '	</div><span class="loading__text">Loading</span>',
      '</div>'
    ].join(' '),
    scope: {
      isLoading: '=?'
    },
    controller: ['$rootScope', '$scope', '$timeout', 'errorSvc',
      function ($rootScope, $scope, $timeout, errorSvc) {
        var ctrl = this;
        ctrl.isLoading = ctrl.isLoading || false;
        var threshold;

        $rootScope.$on('$routeChangeStart', function () {
          threshold = $timeout(function () {
            ctrl.isLoading = true;
          }, 500);
        });

        $rootScope.$on('$routeChangeSuccess', function () {
          $timeout.cancel(threshold);
          ctrl.isLoading = false;
        });

        $rootScope.$on('$locationChangeSuccess', function () {
          $timeout.cancel(threshold);
          ctrl.isLoading = false;
        });

        $rootScope.$on('$routeChangeError', function () {
          $timeout.cancel(threshold);
          ctrl.isLoading = false;
        });

        //do not show loading indicator
        //when we have errors
        $scope.$watch(function () {
          return errorSvc.errors.length;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal && newVal > 0) {
            $timeout.cancel(threshold);
            ctrl.isLoading = false;
          }
        });
      }],
    controllerAs: 'routeLoadingCtrl',
    bindToController: true
  };
}
