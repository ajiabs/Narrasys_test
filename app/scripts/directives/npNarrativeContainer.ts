import { ICustomer, INarrative } from '../../models';
import { existy } from '../../shared/services/ittUtils';
import { IDataSvc, IModelSvc } from '../../interfaces';
const TEMPLATE = `
<div class="standaloneAncillaryPage">
	<np-nav on-logout="$ctrl.logout()"></np-nav>
  <np-loading ng-if="$ctrl.narrative == null && $ctrl.customers == null"></np-loading>
  <np-narrative-detail
    ng-if="$ctrl.narrative && $ctrl.customers"
    class="np-narrative-container"
    narrative="$ctrl.narrative"
    customers="$ctrl.customers">
  </np-narrative-detail> 
</div>
`;

interface INarrativeContainerBindings extends ng.IComponentController {

}
class NarrativeContainerController implements INarrativeContainerBindings {
  narrative: INarrative;
  customers: ICustomer[];
  static $inject = ['$q', '$routeParams', 'modelSvc', 'dataSvc', 'authSvc'];
  constructor(
    private $q: ng.IQService,
    private $routeParams,
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc,
    private authSvc) {
    //
  }

  $onInit() {
    this._resolveNarrative()
      .then(({ n, c }) => {
        this.narrative = n;
        this.customers = c;
      });
  }

  logout() {
    this.authSvc.logout();
  }

  private _resolveNarrative(): ng.IPromise<{ n: INarrative, c: ICustomer[] }> {
    const pathOrId = this.$routeParams.narrativePath;
    const cachedNarr = this.modelSvc.getNarrativeByPathOrId(pathOrId);
    let cachedCustomer;

    const doPullFromCache = existy(cachedNarr)
      && existy(cachedNarr.path_slug)
      && existy(cachedNarr.timelines)
      && (cachedNarr.path_slug.en === pathOrId || cachedNarr._id === pathOrId);

    if (doPullFromCache) {
      cachedCustomer = this.modelSvc.customers[cachedNarr.customer_id];
      return this.$q.resolve({ n: cachedNarr, c: [cachedCustomer] });
    }

    return this.dataSvc.getNarrative(pathOrId)
      .then((narrativeData: INarrative) => {
        return this.dataSvc.getCustomer(narrativeData.customer_id, true)
          .then((customer: ICustomer) => ({ n: narrativeData, c: [customer] }));
      });
  }
}


export class NarrativeContainer implements ng.IComponentOptions {
  template: string = TEMPLATE;
  controller = NarrativeContainerController;
  static Name: string = 'npNarrativeContainer'; // tslint:disable-line
}
