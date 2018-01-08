// @npUpgrade-stories-true
import { ICustomer, INarrative } from '../../../models';
import { IDataSvc, IModelSvc } from '../../../interfaces';
import { existy } from '../../../shared/services/ittUtils';

import narrativelistHtml from './narrativelist.html';

interface INarrativeListBindings extends ng.IComponentController {
  customersData: ICustomer[];
}

class NarrativeListController implements INarrativeListBindings {
  customersData: ICustomer[];
  narrativeSelect: boolean = false;
  narrativeRow: any;
  narrativeToEdit: INarrative;
  user: any = null;
  selectedCustomer: ICustomer[];
  canAccess: boolean = false;
  static $inject = ['$location', 'authSvc', 'appState', 'dataSvc', 'modelSvc', 'ittUtils'];
  constructor(
    private $location: ng.ILocationService,
    private authSvc,
    private appState,
    private dataSvc: IDataSvc,
    private modelSvc: IModelSvc) {
    //
  }

  $onInit() {
    this.user = this.appState.user;
    if (this.authSvc.userHasRole('admin') || this.authSvc.userHasRole('customer admin')) {
      this.canAccess = true;
    }

    this._updateAllEvenOdd();
  }

  logout() {
    this.authSvc.logout();
  }

  setSelectedNarrative(customer: ICustomer): void {
    const cachedNarratives = existy(customer.narratives) && customer.narratives.length > 1;
    this.selectedCustomer = [customer];
    //need list of other narratives to for validation of path slugs.
    if (!cachedNarratives) {
      this.dataSvc.getNarrativeList(customer)
        .then(() => {
          this.narrativeSelect = !this.narrativeSelect;
        });
    } else {
      this.narrativeSelect = !this.narrativeSelect;
    }
  }

  customerRowClick(customer: ICustomer, $ev: ng.IAngularEvent): void {
    $ev.stopPropagation();
    customer.isActive = !customer.isActive;
    this.narrativeRow = null;
    this.customersData.forEach((cust) => {
      if (customer._id !== cust._id) {
        cust.isActive = false;
      }
    });
  }

  gotoNarrative(narrativeId: string, $ev: ng.IAngularEvent): void {
    $ev.stopPropagation();
    this.$location.path('/story/' + narrativeId);
  }

  toggleRow(customer: ICustomer, $ev: ng.IAngularEvent) {
    $ev.stopPropagation();
    customer.showNarratives = !customer.showNarratives;
    if (customer.showNarratives) {
      this._toggleNarrativesOpened(customer);
    } else {
      customer.showNarratives = false;
      this._toggleNarrativesClosed();
    }
  }

  setRowClasses(customer: ICustomer) {
    return {
      'hoverIndicator': !customer.showNarratives,
      'container__row--even': customer.evenOdd === false,
      'container__row--odd': customer.evenOdd === true,
      'isActive': customer.isActive
    };
  }

  setNarrativeRowClasses(customer: ICustomer, narrative: INarrative) {
    return {
      'hoverIndicator': customer.showNarratives,
      'container__row--even': narrative.evenOdd === false,
      'container__row--odd': narrative.evenOdd === true,
      'isActive': narrative === this.narrativeRow
    };
  }

  setNarrativeToEdit($ev: ng.IAngularEvent, narrative: INarrative, customer: ICustomer) {
    $ev.stopPropagation();
    this.narrativeToEdit = narrative;
    this.selectedCustomer = [customer];
  }

  closeAddOrEditModal(narrative: INarrative, navigate: boolean) {
    this.narrativeSelect = false;
    this.selectedCustomer = [];
    this.narrativeToEdit = null;
    if (narrative && navigate) {
      this.$location.path('/story/' + narrative._id);
      return;
    }



    if (narrative) { // undo any edits
      for (let c = 0; c < this.customersData.length; c += 1) {
        if (this.customersData[c]._id === narrative.customer_id) {
          for (let n = 0; n < this.customersData[c].narratives.length; n += 1) {
            if (this.customersData[c].narratives[n]._id === narrative._id) {
              this.customersData[c].narratives[n] = narrative;
              break;
            }
          }
        }
      }
    }
  }

  addOrUpdateNarrative($narrative: INarrative): void {
    const method = $narrative._id == null ? 'createNarrative' : 'updateNarrative';
    this._addOrUpdateNarr($narrative, method)
      .then((narrative: INarrative) => this.closeAddOrEditModal(narrative, true))
      .catch((err: any) => this._handleErr(err));
  }

  toggleNarrativeRow(narrative: INarrative, $ev: ng.IAngularEvent) {
    $ev.stopPropagation();

    if (this.narrativeRow === null) {
      this.narrativeRow = narrative;
    } else if (narrative === this.narrativeRow) {
      this.narrativeRow = null;
    } else {
      this.narrativeRow = narrative;
    }

    //close any selected customers
    this.customersData.forEach((cust) => {
      cust.isActive = false;
    });
  }

  private _toggleNarrativesOpened(customer: ICustomer) {
    //lazily load customers and cache them for later
    if (!existy(customer.narratives) || customer.narratives.length === 0) {
      //fetch and cache is async and will handle setting the evenOdd on the narratives/customers
      //after they have resolved.
      this._fetchAndCacheNarratives(customer);
    }
    //if we already cached our narratives and the list length is odd
    //need to update the customers evenOdd.
    if (existy(customer.narratives) && customer.narratives.length >= 1) {
      this._updateAllEvenOdd();
    }

  }

  private _fetchAndCacheNarratives(customer: ICustomer) {
    this.dataSvc.getNarrativeList(customer).then(() => {
      //setting evenOdd after fetching should only need to happen the first time.
      this._updateAllEvenOdd();
    });
  }

  private _updateAllEvenOdd() {
    let rest = 1;
    const len = this.customersData.length;
    for (; rest <= len; rest += 1) {
      if (rest - 1 === 0) {
        this.customersData[0].evenOdd = false;
      }
      const nextCust = this.customersData[rest];
      const currentCust = this.customersData[rest - 1];
      let lastNarr = null;

      if (existy(currentCust.narratives) && currentCust.narratives.length > 0 && currentCust.showNarratives === true) {
        this._updateNarrativeEvenOdd(currentCust);
        lastNarr = currentCust.narratives[currentCust.narratives.length - 1];
      }

      if (!existy(nextCust)) {
        return;
      }

      if (existy(lastNarr)) {
        nextCust.evenOdd = !lastNarr.evenOdd;
      } else {
        nextCust.evenOdd = !currentCust.evenOdd;
      }

    }
  }

  private _updateNarrativeEvenOdd(customer: ICustomer): void {
    customer.narratives = customer.narratives
      .sort((a, b) => {
        const aName = a.name.en.toLowerCase();
        const bName = b.name.en.toLowerCase();
        if (aName < bName) {
          return -1;
        } else if (aName > bName) {
          return 1;
        }
        return 0;
      })
      .reduce(
        (narrs, narr, index) => {
          if (index === 0) {
            //set first narrative to be opposite of customer
            narr.evenOdd = !customer.evenOdd;
            narrs.push(narr);
            return narrs;
          }

          //continue alternating scheme by looking at the prior index and flipping it.
          narr.evenOdd = !narrs[index - 1].evenOdd;
          narrs.push(narr);
          return narrs;
        },
        []
      );
  }

  private _toggleNarrativesClosed() {
    this._updateAllEvenOdd();
  }

  private _addOrUpdateNarr(n: INarrative, method: 'createNarrative' | 'updateNarrative') {
    return this.dataSvc[method](n)
      .then((resp: {data: INarrative}) => {
        const narrative = resp.data;
        let customer = this.modelSvc.customers[narrative.customer_id];
        customer = this.modelSvc.assocNarrativesWithCustomer(customer, [narrative]);
        const custOnScope = this.customersData.filter((cust: ICustomer) => cust._id === customer._id);
        if (custOnScope.length === 1) {
          this._updateNarrativeEvenOdd(customer);
          custOnScope[0] = customer;
          if (method === 'createNarrative') {
            return narrative;
          }
        }
      });
  }

  private _handleErr(err: any) {
    if (err.data.path_slug) {
      this.narrativeToEdit.error = 'path slug is already taken';
    }
  }
}


export class NarrativeList implements ng.IComponentOptions {
  bindings: any = {
    customersData: '<'
  };
  template: string = narrativelistHtml;
  controller = NarrativeListController;
  static Name: string = 'npNarrativeList'; // tslint:disable-line
}

