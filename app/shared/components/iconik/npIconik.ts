import { IIconikSvc } from '../../../interfaces';
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
  static $inject = ['iconikSvc'];
    
  constructor(public iconikSvc: IIconikSvc) {
  }
    
    $onInit() {
	console.log('np-iconik init!');
	console.log(this.iconikSvc)
    }

    updateSearchResults() {
	this.iconikSvc.search('7e7e4b52-1e27-11e8-b25c-0a580a000439', 'eyJhbGciOiJIUzI1NiIsImlhdCI6MTUyMjQzMjA2NCwiZXhwIjozMDk5MjMyMDY0fQ.eyJpZCI6IjczYmJkZjllLTM0NDItMTFlOC1hN2VjLTBhNTgwYTAwMDM3MyJ9.1v6nNisE3_S9Kr6DJPmIk-bcXKrqsniJFnXstTq0iPY', this.searchCriteria).then( (response) => {
            this.searchResults = IconikController.parseSearchResults(response.data.objects);
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
