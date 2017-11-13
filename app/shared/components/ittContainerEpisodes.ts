// @npUpgrade-shared-true
import { IContainer } from '../../models';
import { IDataSvc, IModelSvc } from '../../interfaces';

const TEMPLATE = `
<!-- consider breaking these into separate templates altogether, since they have different purposes -->
<!-- used in narrative creation -->
<div ng-style="{'text-indent': 1 * $ctrl.depth + 'em'}">
  <div ng-if="!$ctrl.container.episodes.length"
      class="container"
      ng-class="{isOpen: $ctrl.container.wasClicked, isClosed: !$ctrl.container.wasClicked}"
      ng-click="$ctrl.toggle();$ctrl.loadChildren()"
      ng-bind-html="$ctrl.container.display_name">
  </div>
  <div ng-if="$ctrl.container.episodes.length" ng-style="{'text-indent': $ctrl.depth === 3 ? '4em' : ''}">
    <span class="hoverIndicator">
      <a
        ng-click="$ctrl.onNodeClick({node: $ctrl.container.episodes[0]})"
        ng-bind-html="$ctrl.containers[$ctrl.container._id].display_name"></a>({{$ctrl.container.status}})
    </span>
  </div>
</div>
<np-container-episodes
  ng-if="$ctrl.container.wasClicked"
  ng-repeat="child in $ctrl.container.children" 
  container="$ctrl.containers[child._id]"
  for-admin="true"
  depth="$ctrl.depth + 1"
  on-node-click="$ctrl.onNodeClick({ node: node })">
</np-container-episodes>
`;

interface IContainerEpisodesBindings extends ng.IComponentController {
  container: IContainer;
  forAdmin: boolean;
  depth: number;
  onNodeClick: (node: string) => ({ node });
}

class ContainerEpisodesController implements IContainerEpisodesBindings {
  container: IContainer;
  forAdmin: boolean;
  depth: number;
  onNodeClick: (e: any) => any;
  //props
  containers: any;
  crossEpisodePath: string;
  episodeId: string;
  static $inject = ['modelSvc', 'appState', 'dataSvc'];

  constructor(
    private modelSvc: IModelSvc,
    private appState,
    private dataSvc: IDataSvc) {
    //
  }

  $onInit() {
    this.containers = this.modelSvc.containers;
    this.crossEpisodePath = this.appState.crossEpisodePath;
    this.episodeId = this.appState.episodeId;
  }

  loadChildren() {
    if (this.containers[this.container._id].haveNotLoadedChildData) {
      this.dataSvc.getContainer(this.container._id);
    }
  }

  toggle() {
    this.container.wasClicked = !this.container.wasClicked;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ContainerEpisodes implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    container: '<',
    forAdmin: '<',
    depth: '<',
    onNodeClick: '&'
  };
  template: string = TEMPLATE;
  controller = ContainerEpisodesController;
  static Name: string = 'npContainerEpisodes'; // tslint:disable-line
}

// ittContainerEpisodes.$inject = ['modelSvc', 'recursionHelper', 'appState', 'dataSvc'];
//
// export default function ittContainerEpisodes(modelSvc, recursionHelper, appState, dataSvc) {
//   return {
//     restrict: 'A',
//     replace: false,
//     scope: {
//       container: '=ittContainerEpisodes',
//       forAdmin: '=forAdmin',
//       onNodeClick: '&',
//       rootContext: '='
//     },
//     templateUrl: "templates/containerepisodes.html",
//     controller: ['$scope', function ($scope) {
//
//       $scope.selectEpisode = function (e) {
//         $scope.onNodeClick({node: e});
//         console.log('ctrl select epi', e);
//         // $scope.emit('episodeSelected', e);
//       };
//     }],
//
//     compile: function (element) {
//       // Use the compile function from the recursionHelper,
//       // And return the linking function(s) which it returns
//       return recursionHelper.compile(element, function (scope) {
//
//         scope.containers = modelSvc.containers;
//         scope.crossEpisodePath = appState.crossEpisodePath;
//         scope.episodeId = appState.episodeId;
//
//         scope.loadChildren = function () {
//           if (modelSvc.containers[scope.container._id].haveNotLoadedChildData) {
//             dataSvc.getContainer(scope.container._id);
//           }
//         };
//         scope.toggle = function () {
//           scope.container.wasClicked = !scope.container.wasClicked;
//         };
//         // scope.selectEpisode = function (e) {
//         // 	// console.log(scope.container.episodes[0]);
//         // 	// console.log('hmm', scope.onChoice);
//         // 	scope.$emit('episodeSelected', e);
//         // };
//
//       });
//     }
//   };
//
// }
