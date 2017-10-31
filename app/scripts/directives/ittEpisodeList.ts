export default function ittEpisodeList() {
  return {
    restrict: 'A',
    replace: true,
    controller: ['$scope', '$location', '$timeout', 'appState', 'authSvc', 'dataSvc', 'modelSvc', 'ittUtils',
      function ($scope, $location, $timeout, appState, authSvc, dataSvc, modelSvc, ittUtils) {
        $scope.logout = function () {
          authSvc.logout();
        };
        $scope.appState = appState;
        $scope.loading = true;
        $scope.containers = modelSvc.containers;
        $scope.userHasRole = authSvc.userHasRole.bind(authSvc);
        dataSvc.getCustomerList();
        dataSvc.getContainerRoot().then(function (rootIDs) {
          $scope.root = {
            children: []
          };
          angular.forEach(rootIDs, function (id) {
            $scope.root.children.push(modelSvc.containers[id]);

          });

          walkContainers($scope.root.children, true, true);
          $scope.loading = false;
        }, function () {
          $scope.failedLogin = true;
          $scope.loading = false;

        });


        function walkContainers(containerList, evenOdd, findLastContainer) {

          containerList.sort(function (a, b) {
            if (a.name.en.toLowerCase() < b.name.en.toLowerCase()) {
              return -1;
            } else if (a.name.en.toLowerCase() > b.name.en.toLowerCase()) {
              return 1;
            } else {
              return 0;
            }
          });

          angular.forEach(containerList, function (_container) {
            var container = modelSvc.containers[_container._id];

            container.evenOdd = evenOdd;
            evenOdd = !evenOdd;

            if (container.isActive && findLastContainer) {
              $scope.lastClickedContainer = {container: container, bool: false};
            }

            if (container.showChildren && container.children) {
              evenOdd = walkContainers((container.children), evenOdd, findLastContainer);
            }
          });

          return evenOdd;
        }

        $scope.onContainerAdd = onContainerAdd;
        function onContainerAdd($container) {
          walkContainers($scope.root.children, !$container.evenOdd, false);
        }

        $scope.onContainerClick = onContainerClick;
        function onContainerClick($container) {
          if ($container.container.children) {

            if ($container.bool === false) {
              $container.container.showChildren = !$container.container.showChildren;
            }

            // have already loaded kids

            walkContainers($scope.root.children, true, false);
          } else {
            dataSvc.getContainer($container.container._id).then(function (id) {
              $container.container = modelSvc.containers[id];

              if ($container.bool === false) {
                $container.container.showChildren = true;
              }

              walkContainers($scope.root.children, true, false);
            });
          }

          if ($container.bool === true) {
            if (ittUtils.existy($scope.lastClickedContainer)) {


              if ($scope.lastClickedContainer.container !== $container.container) {
                $scope.lastClickedContainer.container.isActive = false;
                $scope.lastClickedContainer = $container;
                $scope.lastClickedContainer.container.isActive = true;
              } else {
                $scope.lastClickedContainer.container.isActive = !$scope.lastClickedContainer.container.isActive;
              }

            } else {
              $scope.lastClickedContainer = $container;
              $scope.lastClickedContainer.container.isActive = true;
            }
          }

        }

      }]
  };
}
