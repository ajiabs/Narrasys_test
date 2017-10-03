/* For admin screen episode list */
import { IContainer } from '../models';
import { IEpisodeEditService } from './episode/episodeEdit.service';
ittContainer.$inject = ['$timeout', '$location', 'appState', 'modelSvc', 'recursionHelper', 'dataSvc', 'ittUtils', 'episodeEdit'];

export default function ittContainer($timeout, $location, appState, modelSvc, recursionHelper, dataSvc, ittUtils, episodeEdit: IEpisodeEditService) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      container: '=ittContainer',
      depth: '=depth',
      onContainerClick: '&',
      onContainerAdd: '&',
      clickRootContext: '=',
      addRootContext: '='
    },
    templateUrl: 'templates/container.html',
    controller: ['$scope', '$location', 'modelSvc', 'authSvc', 'dataSvc',
      function ($scope, $location, modelSvc, authSvc, dataSvc) {
      $scope.toggleNarrativeModal = toggleNarrativeModal;
      $scope.postNewNarrative = postNewNarrative;
      $scope.showNarrativeModal = false;
      $scope.resolvingNarrative = false;
      $scope.isAdmin = authSvc.userHasRole('admin');
      $scope.canAccess = $scope.isAdmin || authSvc.userHasRole('customer admin');
      $scope.getLinkStatusReport = dataSvc.getCustomerLinkStatusReportSpreadsheet;
      //needs to be an array, not a k/v store
      $scope.customers = modelSvc.getCustomersAsArray();

      function toggleNarrativeModal() {
        $scope.showNarrativeModal = !$scope.showNarrativeModal;
      }

      function postNewNarrative(narrativeData) {
        $scope.resolvingNarrative = true;
        dataSvc.generateNewNarrative(narrativeData.c, narrativeData.n).then(function (narrative) {
          modelSvc.cache('narrative', narrative);
          $location.path('/story/' + narrative._id);
          $scope.resolvingNarrative = false;
        });
      }


    }],
    compile: function (element) {

      // Use the compile function from the recursionHelper,
      // And return the linking function(s) which it returns
      return recursionHelper.compile(element, function (scope) {
        scope.appState = appState;
        scope.containers = modelSvc.containers;
        scope.customer = modelSvc.customers[scope.container.customer_id];
        // TEMP obviously
        scope.isDemoServer = ($location.host().match(/demo|localhost|api-dev|client.dev/));

        scope.selectText = function (event) {
          event.target.select(); // convenience for selecting the episode url
        };

        scope.containerTypes = ['customer', 'project', 'module', 'episode'];

        scope.onToggleChildren = function (bool) {
          scope.onContainerClick({$container: {container: scope.container, bool: bool}});
        };

        scope.renameContainer = function () {
          console.log('CHanging container name from ', scope.container.name.en, ' to ', scope.container.newContainerName);
          console.log(scope.container);

          var newContainer = {};
          angular.forEach(['_id', 'customer_id', 'episodes', 'keywords', 'parent_id', 'sort_order'], function (field) {
            newContainer[field] = angular.copy(scope.container[field]);
          });
          newContainer.name = {
            en: scope.container.newContainerName
          };
          dataSvc.updateContainer(newContainer).then(function () {
            scope.container.editingContainer = false;
          });
        };

        scope.addContainer = function (container) {
          const newContainer = {
            'customer_id': scope.container.customer_id,
            'parent_id': scope.container._id,
            'name': {
              en: angular.copy(scope.container.newContainerTitle)
            }
          };
          dataSvc.createContainer(newContainer).then((newContainer) => {
            console.log('Created container:', newContainer);
            if (scope.depth === 2) {
              return episodeEdit.addEpisodeToContainer(newContainer)
                // onContainerAdd will force a sort
                .then((container: IContainer) => scope.onContainerAdd({ $container: container }))
                .catch(e => console.log('error adding episode to container!'));
            } else {
              scope.onContainerAdd({ $container: container });
            }
          });
          scope.container.newContainerTitle = '';
          scope.container.addingContainer = false;

          //container.showChildren will be undefined at the project level.
          if (!ittUtils.existy(container.showChildren) || container.showChildren === false) {
            scope.onToggleChildren(false);
          }

        };

        scope.deleteEpisodeAndContainer = function (id) {
          var containerToDelete = modelSvc.containers[id];

          // Optimistically delete the container from modelSvc.containers[containerToDelete.parent_id].children
          // TODO This really ought to be a dataSvc thing, and shouldn't assume success
          // (but the worst that happens is that something appears to be deleted when it wasn't, until next reload. Could be worse)
          // console.log("About to delete", containerToDelete);

          var parentId = (containerToDelete.parent_id) ? containerToDelete.parent_id : containerToDelete.ancestry.replace(/.*\//, '');

          var parent = modelSvc.containers[parentId];
          // console.log("parent is ", parent);
          var newChildren = [];
          angular.forEach(parent.children, function (child) {
            if (child._id !== id) {
              newChildren.push(child);
            }
          });
          parent.children = newChildren;

          if (containerToDelete.episodes.length) {
            dataSvc.deleteEpisode(containerToDelete.episodes[0]) // Containers only ever have one episode for now (not sure why, but sticking to it as it seems to work)
              .then(function () {
                $timeout(function () { // I am being lazy and not bothering to figure out why .then isn't sufficient here
                  dataSvc.deleteContainer(containerToDelete._id);
                }, 250);
              });
          } else {
            dataSvc.deleteContainer(containerToDelete._id);
          }

        };

      });
    }
  };

}
