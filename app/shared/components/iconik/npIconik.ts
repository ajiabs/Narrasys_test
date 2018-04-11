import { IIconikSvc, IDataSvc, IModelSvc } from '../../../interfaces';
import iconikHtml from './iconik.html';

interface IIconikBindings extends ng.IComponentController {
    containerId: string;
    searchCriteria: string;
    searchResults: string;  
}

class IconikController implements IIconikBindings {
    containerId: string;
    searchCriteria: string;
    searchResults: array = []; 
    showIconikBrowser: boolean = false;
    federationConfiguration: IFederationConfiguration;
    container: IContainer;
    customer: ICustomer;
    federationConfiguration: IFederationConfiguration;
    currentPage;
    pages;
    static $inject = ['iconikSvc', 'dataSvc', 'modelSvc'];
    
    constructor(
	public iconikSvc: IIconikSvc,
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
	this.dataSvc.getCustomerFederationConfigurationByServiceName(this.container.customer_id, "CantemoIconikService").then((federationConfiguration) => {
	    this.federationConfiguration = federationConfiguration
	    if(this.federationConfiguration) {
		this.dataSvc.getCustomer(this.container.customer_id, true).then( (customer) => {
		    this.customer = customer
		});
	    }
	});
    }

    updateSearchResults(page=1) {
	this.currentPage = page;
	this.iconikSvc.search(this.federationConfiguration.request_headers['app-id'], this.federationConfiguration.request_headers['auth-token'], this.searchCriteria, this.currentPage).then( (response) => {
	    console.log(response.data);
	    this.pages = response.data.pages;
            this.searchResults = IconikController.parseSearchResults(response.data.objects);
        });
    }

    importAsset(assetId) {
	var federationData = {
	    'federation_data': {
              'iconik_asset_id': assetId
            }
	}
	this.dataSvc.importFederatedAssetIntoNarrasys(this.containerId, this.federationConfiguration._id, federationData).then( (response) => {
	    alert(response.file.name.en+" successfully imported!");
	});
    }

    getPages() {
	return new Array(this.pages); 
    }

    private static parseSearchResults(objects){
	var newResults = []
	objects.forEach(function(item) {
            var url;
            (item.keyframes || []).forEach(function(keyframe) {
		if (keyframe.type = 'KEYFRAME') {
		    url = keyframe.url;
		}
            })
	    newResults.push(
		{
		    'id': item.id,
		    'title': item.title,
		    'preview_url': url
		}
	    );
	})
	return newResults;
    }

}

export class Iconik implements ng.IComponentOptions {
  bindings: any = {
    containerId: '@'
  };
  template = iconikHtml;
  controller = IconikController;
  static Name: string = 'npIconik'; // tslint:disable-line
}
