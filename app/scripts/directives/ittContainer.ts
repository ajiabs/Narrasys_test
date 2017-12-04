/* For admin screen episode list */
import { createInstance, IContainer, ICustomer, INarrative } from '../models';
import { IDataSvc, IModelSvc, IEpisodeEditService } from '../interfaces';
import { capitalize, existy, omit, pick } from '../services/ittUtils';

interface IContainerBindings extends ng.IComponentController {
  container: IContainer;
  depth: Number;
  onContainerClick: ($ev: { $container: { container: IContainer, bool: boolean } }) => ({
    $ev: { $container: { container: IContainer, bool: boolean }
  }});
  onContainerAdd: ($ev: { $container: IContainer }) => ({ $container: IContainer });
  onContainerRemove: ($ev: { $container: IContainer }) => ({ $container: IContainer });
}

class ContainerController implements IContainerBindings {
  container: IContainer;
  depth: number;
  onContainerClick: ($ev: { $container: { container: IContainer, bool: boolean } }) => ({
    $ev: { $container: { container: IContainer, bool: boolean }
    }});
  onContainerAdd: ($ev: { $container: IContainer }) => ({ $container: IContainer });
  onContainerRemove: ($ev: { $container: IContainer }) => ({ $container: IContainer });
  //
  showNarrativeModal: boolean;
  resolvingNarrative: boolean;
  customers: ICustomer[];
  customer: ICustomer;
  containers: { [containerId: string]: IContainer };
  isDemoServer: boolean;
  containerTypes: string[] = ['customer', 'project', 'module', 'episode'];
  static $inject = ['$timeout', '$location', 'appState', 'modelSvc', 'dataSvc', 'authSvc', 'episodeEdit'];
  constructor(
    private $timeout: ng.ITimeoutService,
    private $location: ng.ILocationService,
    public appState,
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc,
    private authSvc,
    private episodeEdit: IEpisodeEditService) {

  }

  get isAdmin() {
    return this.authSvc.userHasRole('admin');
  }

  get canAccess() {
    return this.isAdmin || this.authSvc.userHasRole('customer admin');
  }

  get containerType() {
    if (this.depth > 0) {
      return capitalize(this.containerTypes[this.depth]);
    }
  }

  $onInit() {
    this.customers = this.modelSvc.getCustomersAsArray();
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
      en: this.container.newContainerName
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
        return this.episodeEdit.addEpisodeToContainer(newContainer)
        // onContainerAdd will force a sort
          .then((container: IContainer) => this.onContainerAdd({ $container: container }))
          .catch((e: any) => console.log('error adding episode to container'));
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

  deleteContainer() {
    this.onContainerRemove({ $container: this.container });
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class Container implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    container: '<',
    containers: '<',
    depth: '<',
    onContainerClick: '&',
    onContainerAdd: '&',
    onContainerRemove: '&'
  };
  templateUrl: string = 'templates/container.html';
  controller = ContainerController;
  static Name: string = 'npContainer'; // tslint:disable-line
}
