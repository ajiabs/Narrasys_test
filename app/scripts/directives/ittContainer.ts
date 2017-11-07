/* For admin screen episode list */
import { createInstance, IContainer, ICustomer, IEpisode, INarrative } from '../models';
import { IDataSvc, IModelSvc } from '../interfaces';
import { existy, pick } from '../services/ittUtils';
import { IEpisodeEditService } from './episode/episodeEdit.service';

interface IContainerBindings extends ng.IComponentController {
  container: IContainer;
  depth: Number;
  onContainerClick: ($ev: { $container: { container: IContainer, bool: boolean } }) => ({
    $ev: { $container: { container: IContainer, bool: boolean }
  }});
  onContainerAdd: ($ev: { $container: IContainer }) => ({ $container: IContainer });
}

class ContainerController implements IContainerBindings {
  container: IContainer;
  depth: Number;
  onContainerClick: ($ev: { $container: { container: IContainer, bool: boolean } }) => ({
    $ev: { $container: { container: IContainer, bool: boolean }
    }});
  onContainerAdd: ($ev: { $container: IContainer }) => ({ $container: IContainer });
  //
  showNarrativeModal: boolean;
  resolvingNarrative: boolean;
  customers: ICustomer[];
  customer: ICustomer;
  containers: { [containerId: string]: IContainer };
  isDemoServer: boolean;
  containerTypes: string[] = ['customer', 'project', 'module', 'episode'];
  static $inject = ['$timeout', '$location', 'appState', 'modelSvc', 'dataSvc', 'authSvc'];
  constructor(
    private $timeout: ng.ITimeoutService,
    private $location: ng.ILocationService,
    public appState,
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc,
    private authSvc) {

  }

  get isAdmin() {
    return this.authSvc.userHasRole('admin');
  }

  get canAccess() {
    return this.isAdmin || this.authSvc.userHasRole('customer admin');
  }

  $onInit() {
    this.customers = this.modelSvc.getCustomersAsArray();
    this.containers = this.modelSvc.containers;
  }

  toggleNarrativeModal() {
    this.showNarrativeModal = !this.showNarrativeModal;
  }

  postNewNarrative({ narrative, containerId }: { containerId: string, narrative: INarrative }) {
    this.resolvingNarrative = true;
    this.dataSvc.generateNewNarrative(containerId, narrative).then((narrativeResp: INarrative) => {
      this.modelSvc.cache('narrative', narrativeResp);
      this.$location.path('/story/' + narrativeResp._id);
      this.resolvingNarrative = false;
    });
  }

  getLinkStatusReport(customerId: string): void {
    this.dataSvc.getCustomerLinkStatusReportSpreadsheet(customerId);
  }

  selectText(event: any): void {
    event.target.select(); // convenience for selecting the episode url
  }

  onToggleChildren(bool: boolean) {
    const container = this.container;
    this.onContainerClick({ $container: { container, bool } });
  }

  renameContainer() {
    const newContainer = createInstance<IContainer>(
      'Container',
      pick(this.container, ['_id', 'customer_id', 'episodes', 'keywords', 'parent_id', 'sort_order'])
    );

    newContainer.name = {
      en: this.container.newContainerTitle
    };
    this.dataSvc.updateContainer(newContainer).then(() => {
      this.container.editingContainer = false;
    });
  }

  addContainer(container: IContainer) {
    const newContainer = {
      'customer_id': this.container.customer_id,
      'parent_id': this.container._id,
      'name': {
        en: angular.copy(this.container.newContainerTitle)
      }
    };
    this.dataSvc.createContainer(newContainer).then((newContainer: IContainer) => {
      console.log('Created container:', newContainer);
      if (this.depth === 2) {
        const newEpisode = {
          'container_id': newContainer._id,
          'title': angular.copy(newContainer.name)
        };
        this.dataSvc.getCommon().then(() => {
          this.dataSvc.createEpisode(newEpisode).then((episode: IEpisode) => {
            console.log('Created episode: ', episode);
            const newScene = {
              '_type': 'Scene',
              'title': {},
              'description': {},
              'templateUrl': 'templates/scene/1col.html',
              'start_time': 0,
              'end_time': 0,
              'episode_id': episode._id
            };

            this.dataSvc.storeItem(newScene);
            //will force a sort
          }).then(() => {
            this.onContainerAdd({ $container: container });
          });
        });
      } else {
        this.onContainerAdd({ $container: container });
      }
    });
    this.container.newContainerTitle = '';
    this.container.addingContainer = false;
    //container.showChildren will be undefined at the project level.
    if (!existy(container.showChildren) || container.showChildren === false) {
      this.onToggleChildren(false);
    }
  }

  deleteEpisodeAndContainer(id: string) {
    const containerToDelete = this.modelSvc.containers[id];

    // Optimistically delete the container from modelSvc.containers[containerToDelete.parent_id].children
    // TODO This really ought to be a dataSvc thing, and shouldn't assume success
    // (but the worst that happens is that something appears to be deleted when it wasn't,
    // until next reload. Could be worse)
    // console.log("About to delete", containerToDelete);

    const parentId =
      (containerToDelete.parent_id) ? containerToDelete.parent_id : containerToDelete.ancestry.replace(/.*\//, '');

    const parent = this.modelSvc.containers[parentId];
    // console.log("parent is ", parent);
    const newChildren = [];
    angular.forEach(parent.children, (child) => {
      if (child._id !== id) {
        newChildren.push(child);
      }
    });
    parent.children = newChildren;

    if (containerToDelete.episodes.length) {
      this.dataSvc.deleteEpisode(containerToDelete.episodes[0])
      // Containers only ever have one episode for now (not sure why, but sticking to it as it seems to work)
        .then(() => {
          this.$timeout(
            () => { // I am being lazy and not bothering to figure out why .then isn't sufficient here
              this.dataSvc.deleteContainer(containerToDelete._id);
            },
            250
          );
        });
    } else {
      this.dataSvc.deleteContainer(containerToDelete._id);
    }
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class Container implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    container: '<',
    depth: '<',
    onContainerClick: '&',
    onContainerAdd: '&'
  };
  templateUrl: string = 'templates/container.html';
  controller = ContainerController;
  static Name: string = 'npContainer'; // tslint:disable-line
}
