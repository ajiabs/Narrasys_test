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
    container: any;
    customer: any;
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

        this.dataSvc.getCustomer(this.container.customer_id, true).then( (customer) => {
	    this.customer = customer
	});
    }

    updateSearchResults() {
	this.iconikSvc.search('7e7e4b52-1e27-11e8-b25c-0a580a000439', 'eyJhbGciOiJIUzI1NiIsImlhdCI6MTUyMjQzMjA2NCwiZXhwIjozMDk5MjMyMDY0fQ.eyJpZCI6IjczYmJkZjllLTM0NDItMTFlOC1hN2VjLTBhNTgwYTAwMDM3MyJ9.1v6nNisE3_S9Kr6DJPmIk-bcXKrqsniJFnXstTq0iPY', this.searchCriteria).then( (response) => {
            this.searchResults = IconikController.parseSearchResults(response.data.objects);
        });
    }

    importAsset(assetId) {
	var federationData = {
	    'federation_data': {
              'iconik_asset_id': assetId
            }
	}
	this.dataSvc.importFederatedAssetIntoNarrasys(this.containerId, '5abec458d72cc3b71f000006', federationData).then( (response) => {
	    alert(response.file.name.en+" successfully imported!");
	});
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
