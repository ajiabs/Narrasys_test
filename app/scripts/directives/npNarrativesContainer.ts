import { IDataSvc, IModelSvc } from '../interfaces';
import { ICustomer } from '../models';

const TEMPLATE = `
<div class="standaloneAncillaryPage">
	<np-nav on-logout="$ctrl.logout()"></np-nav>
	<h1>Narratives</h1>
	<np-loading ng-if="$ctrl.customersData == null"></np-loading>
	<np-narrative-list
	  ng-if="$ctrl.customersData"
	  class="np-narrative-container"
	  customers-data="$ctrl.customersData">
	</np-narrative-list>
</div>
`;

interface INarrativesContainerBindings extends ng.IComponentController {

}

class NarrativesContainerController implements INarrativesContainerBindings {
  customersData: ICustomer[];
  static $inject = ['$q', 'authSvc', 'dataSvc', 'modelSvc'];
  constructor(
    private $q: ng.IQService,
    private authSvc,
    private dataSvc: IDataSvc,
    private modelSvc: IModelSvc) {
    //
  }

  $onInit() {
    this._resolveCustomers()
      .then((c: ICustomer[]) => this.customersData = this.modelSvc.getCustomersAsArray());
  }

  logout() {
    this.authSvc.logout();
  }

  private _resolveCustomers(): ng.IPromise<ICustomer[]> {
    //needs to be an array
    const cachedCustomers = this.modelSvc.getCustomersAsArray();
    //if use visits /story/:id prior to visiting this route, they will have a single
    //narrative in modelSvc. We consider the cache 'empty' if the only narrative
    //in it came from loading data for /story/:id. Otherwise when they visit
    // /stories, the only listing they would see would be the narrative from
    // /stories/:id.
    const isCached = Object.keys(cachedCustomers).length > 0;

    if (isCached) {
      //since this is going to be displayed in a dropdown, it needs to be an array of objects.

      return this.$q.resolve(cachedCustomers);
    }

    return this.authSvc.authenticate()
      .then(() => this.dataSvc.getCustomerList())
      .then((customers: ICustomer[]) => customers);
  }
}


export class NarrativesContainer implements ng.IComponentOptions {
  bindings: any = {};
  template: string = TEMPLATE;
  controller = NarrativesContainerController;
  static Name: string = 'npNarrativesContainer'; // tslint:disable-line
}
