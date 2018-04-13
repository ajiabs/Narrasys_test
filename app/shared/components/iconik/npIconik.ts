import { IIconikSvc, IDataSvc, IModelSvc } from '../../../interfaces';
import iconikHtml from './iconik.html';

interface IIconikBindings extends ng.IComponentController {
    federationConfigurationId: string;
    containerId: string;
    federationName: string;
    searchCriteria: string;
    searchResults: string;  
}

class IconikController implements IIconikBindings {
    federationConfigurationId: string;
    containerId: string;
    federationName: string;
    searchCriteria: string;
    searchResults: array = []; 
    showIconikBrowser: boolean = false;
    federationConfiguration: IFederationConfiguration;
    container: IContainer;
    customer: ICustomer;
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
        if (this.modelSvc.federationConfigurations[this.federationConfigurationId]) {
	    this.federationConfiguration = this.modelSvc.federationConfigurations[this.federationConfigurationId];
	} else {
	    this.dataSvc.getFederationConfiguration(this.federationConfigurationId).then(() => {
		this.federationConfiguration = this.modelSvc.federationConfigurations[this.federationConfigurationId];
	    });
	}
	if(this.federationConfiguration) {
	    this.federationName = this.federationConfiguration.name;
	    if (this.modelSvc.containers[this.containerId]) {
	        this.container = this.modelSvc.containers[this.containerId];
	    } else {
	        this.dataSvc.getContainer(this.containerId).then(() => {
		    this.container = this.modelSvc.containers[this.containerId];
	        });
	    }
	    this.dataSvc.getCustomer(this.container.customer_id, true).then( (customer) => {
                this.customer = customer
	    });
	}
    }

    updateSearchResults(page=1) {
	this.currentPage = page;
	this.iconikSvc.search(this.federationConfiguration.uri, this.federationConfiguration.request_headers['app-id'], this.federationConfiguration.request_headers['auth-token'], this.searchCriteria, this.currentPage).then( (response) => {
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
    federationConfigurationId: '@',
    containerId: '@'	
  };
  template = iconikHtml;
  controller = IconikController;
  static Name: string = 'npIconik'; // tslint:disable-line
}
