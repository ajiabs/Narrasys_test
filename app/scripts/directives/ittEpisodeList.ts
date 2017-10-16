import { IContainer } from '../models';
import { existy } from '../services/ittUtils';

const TEMPLATE = `
<div ng-if="$ctrl.context === 'episode' && $ctrl.userHasRole('admin') || $ctrl.userHasRole('customer admin')">
  <itt-loading ng-if="$ctrl.loading"></itt-loading>

  <div ng-repeat="child in $ctrl.root.children"
     itt-container="$ctrl.containers[child._id]"
     ng-class="{
     'container__row--odd': $ctrl.containers[child._id].evenOdd === false,
     'container__row--even': $ctrl.containers[child._id].evenOdd === true 
     }"
     depth="0"
     on-container-click="$ctrl.onContainerClick($container)"
     on-container-add="$ctrl.onContainerAdd($container)"
     add-root-context="$ctrl.onContainerAdd"
     click-root-context="$ctrl.onContainerClick">

  </div>
  <div ng-if="$ctrl.showAdmin">
    Looks like you aren't logged in as an admin -- <a ng-click="logout();">try again</a>.
  </div>
</div>

<div ng-if="$ctrl.context === 'narrative'">
      Choose an episode:
      <button ng-click="$ctrl.onCancel()">cancel</button>
      <np-container-episodes
        ng-repeat="child in $ctrl.root.children"
        depth="0"
        on-node-click="$ctrl.selectEpisode(node)"
        for-admin="true"
        container="$ctrl.containers[child._id]">
      </np-container-episodes>
</div>
`;

interface IEpisodeListBindings extends ng.IComponentController {
  context: 'narrative' | 'episode';
  onCancel?: (e: any) => any;
  onEpisodeSelect?: (e: any) => any;
}

class EpisodeListController implements IEpisodeListBindings {
  context: 'narrative' | 'episode';
  onCancel?: (e: any) => any;
  onEpisodeSelect?: (e: any) => any;
  loading: boolean;
  failedLogin: boolean;
  containers: IContainer[];
  lastClickedContainer: { container: IContainer, bool: boolean };
  root: IContainer;
  static $inject = ['$location', '$timeout', 'appState', 'authSvc', 'dataSvc', 'modelSvc', 'ittUtils'];
  constructor(
    private $location: ng.ILocationService,
    private $timeout: ng.ITimeoutService,
    private appState,
    private authSvc,
    private dataSvc,
    private modelSvc) {
    //
  }

  get showAdmin() {
    //!(userHasRole('admin')
    // || userHasRole('customer admin')) || (!loading && (failedLogin || root.children.length == 0))
    return !(
      this.userHasRole('admin')
      || this.userHasRole('customer admin')
      || (!this.loading && (this.failedLogin || this.root.children.length === 0))
    );
  }

  selectEpisode(e) {
    this.onEpisodeSelect({ node: e });
  }

  $onInit() {
    this.loading = true;
    this.containers = this.modelSvc.containers;
    this.dataSvc.getCustomerList();
    this.dataSvc.getContainerRoot()
      .then((rootIDs) => {
        this.root = {
          children: []
        } as IContainer;

        rootIDs.forEach((id: string) => {
          this.root.children.push(this.modelSvc.containers[id]);
        });

        this.walkContainers(this.root.children, true, true);
        this.loading = false;
      })
      .catch((e: any) => {
        this.failedLogin = true;
        this.loading = false;
      });
  }

  logout() {
    this.authSvc.logout();
  }

  userHasRole(role) {
    return this.authSvc.userHasRole(role);
  }

  onContainerAdd($container) {
    this.walkContainers(this.root.children, !$container.evenOdd, false);
  }

  walkContainers(containerList: IContainer[], _evenOdd: boolean, findLastContainer: boolean) {
    let evenOdd = _evenOdd; // no-param-reassign
    containerList.sort((a, b) => {
      if (a.name.en.toLowerCase() < b.name.en.toLowerCase()) {
        return -1;
      } else if (a.name.en.toLowerCase() > b.name.en.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });

    containerList.forEach((_container) => {
      const container = this.modelSvc.containers[_container._id];

      container.evenOdd = evenOdd;
      evenOdd = !evenOdd;

      if (container.isActive && findLastContainer) {
        this.lastClickedContainer = { container, bool: false };
      }

      if (container.showChildren && container.children) {
        evenOdd = this.walkContainers((container.children), evenOdd, findLastContainer);
      }
    });

    return evenOdd;
  }

  onContainerClick($container) {
    if ($container.container.children) {

      if ($container.bool === false) {
        $container.container.showChildren = !$container.container.showChildren;
      }

      // have already loaded kids

      this.walkContainers(this.root.children, true, false);
    } else {
      this.dataSvc.getContainer($container.container._id).then((id) => {
        $container.container = this.modelSvc.containers[id];

        if ($container.bool === false) {
          $container.container.showChildren = true;
        }

        this.walkContainers(this.root.children, true, false);
      });
    }
    if ($container.bool === true) {
      if (existy(this.lastClickedContainer)) {
        if (this.lastClickedContainer.container !== $container.container) {
          this.lastClickedContainer.container.isActive = false;
          this.lastClickedContainer = $container;
          this.lastClickedContainer.container.isActive = true;
        } else {
          this.lastClickedContainer.container.isActive = !this.lastClickedContainer.container.isActive;
        }

      } else {
        this.lastClickedContainer = $container;
        this.lastClickedContainer.container.isActive = true;
      }
    }
  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class EpisodeList implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    context: '@',
    onCancel: '&?',
    onEpisodeSelect: '&?'
  };
  template: string = TEMPLATE;
  controller = EpisodeListController;
  static Name: string = 'npEpisodeList'; // tslint:disable-line
}

// export default function ittEpisodeList() {
//   return {
//     restrict: 'A',
//     replace: true,
//     controller: ['$scope', '$location', '$timeout', 'appState', 'authSvc', 'dataSvc', 'modelSvc', 'ittUtils',
//       function ($scope, $location, $timeout, appState, authSvc, dataSvc, modelSvc, ittUtils) {
//         $scope.logout = function () {
//           authSvc.logout();
//         };
//         $scope.appState = appState;
//         $scope.loading = true;
//         $scope.containers = modelSvc.containers;
//         $scope.userHasRole = authSvc.userHasRole;
//         dataSvc.getCustomerList();
//         dataSvc.getContainerRoot().then(function (rootIDs) {
//           $scope.root = {
//             children: []
//           };
//           angular.forEach(rootIDs, function (id) {
//             $scope.root.children.push(modelSvc.containers[id]);
//
//           });
//
//           walkContainers($scope.root.children, true, true);
//           $scope.loading = false;
//         }, function () {
//           $scope.failedLogin = true;
//           $scope.loading = false;
//
//         });
//
//
//         function walkContainers(containerList: IContainer[], evenOdd: boolean, findLastContainer: boolean) {
//
//           containerList.sort(function (a, b) {
//             if (a.name.en.toLowerCase() < b.name.en.toLowerCase()) {
//               return -1;
//             } else if (a.name.en.toLowerCase() > b.name.en.toLowerCase()) {
//               return 1;
//             } else {
//               return 0;
//             }
//           });
//
//           angular.forEach(containerList, function (_container) {
//             var container = modelSvc.containers[_container._id];
//
//             container.evenOdd = evenOdd;
//             evenOdd = !evenOdd;
//
//             if (container.isActive && findLastContainer) {
//               $scope.lastClickedContainer = {container: container, bool: false};
//             }
//
//             if (container.showChildren && container.children) {
//               evenOdd = walkContainers((container.children), evenOdd, findLastContainer);
//             }
//           });
//
//           return evenOdd;
//         }
//
//         $scope.onContainerAdd = onContainerAdd;
//         function onContainerAdd($container) {
//           walkContainers($scope.root.children, !$container.evenOdd, false);
//         }
//
//         $scope.onContainerClick = onContainerClick;
//         function onContainerClick($container) {
//           if ($container.container.children) {
//
//             if ($container.bool === false) {
//               $container.container.showChildren = !$container.container.showChildren;
//             }
//
//             // have already loaded kids
//
//             walkContainers($scope.root.children, true, false);
//           } else {
//             dataSvc.getContainer($container.container._id).then(function (id) {
//               $container.container = modelSvc.containers[id];
//
//               if ($container.bool === false) {
//                 $container.container.showChildren = true;
//               }
//
//               walkContainers($scope.root.children, true, false);
//             });
//           }
//
//           if ($container.bool === true) {
//             if (ittUtils.existy($scope.lastClickedContainer)) {
//
//
//               if ($scope.lastClickedContainer.container !== $container.container) {
//                 $scope.lastClickedContainer.container.isActive = false;
//                 $scope.lastClickedContainer = $container;
//                 $scope.lastClickedContainer.container.isActive = true;
//               } else {
//                 $scope.lastClickedContainer.container.isActive = !$scope.lastClickedContainer.container.isActive;
//               }
//
//             } else {
//               $scope.lastClickedContainer = $container;
//               $scope.lastClickedContainer.container.isActive = true;
//             }
//           }
//
//         }
//
//       }]
//   };
// }
