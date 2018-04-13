import { IDataSvc, IModelSvc } from '../../../interfaces';
import federationsHtml from './federations.html';

interface IFederationsBindings extends ng.IComponentController {
    containerId: string;
    federationConfigurations: IFederationConfiguration[];
}

class FederationsController implements IFederationsBindings {
    containerId: string;
    static $inject = ['dataSvc', 'modelSvc'];
    
    constructor(
	public dataSvc: IDataSvc,
	public modelSvc: IModelSvc
    ) {
    }
    
    $onInit() {
	if (this.modelSvc.containers[this.containerId]) {
	    this.container = this.modelSvc.containers[this.containerId];
	} else {
	    this.dataSvc.getContainer(this.containerId).then(() => {
		this.container = this.modelSvc.containers[this.containerId];
	    });
	}
	this.dataSvc.getCustomerFederationConfigurations(this.container.customer_id).then( (federationConfigurations) => {
            this.federationConfigurations = federationConfigurations;
	});
	
    }
}

export class Federations implements ng.IComponentOptions {
  bindings: any = {
    containerId: '@'
  };
  template = federationsHtml;
  controller = FederationsController;
  static Name: string = 'npFederations'; // tslint:disable-line
}
