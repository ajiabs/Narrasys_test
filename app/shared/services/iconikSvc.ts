export interface IIconikSvc {
    search(appId, token, criteria): {};
}

export class IconikSvc implements IIconikSvc {
    
    static Name = 'iconikSvc'; // tslint:disable-line
    
    static $inject = ['$http'];
    
    constructor(
	private $http
    ) {
    }
    
    init(): void {
    }
    
    search(uri, appId, token, criteria, page=1, results_per_page=20, media_type=null):{} {
        var facetsFilters = [];
        if(media_type === "video") {
            facetsFilters = [{'name':'media_type','value_in':['video']}];
	} else if (media_type === "image") {
	    facetsFilters = [{'name':'media_type','value_in':['image']}];	
	}
	var req = {
	    method: 'POST',
	    url: '/federated_proxy/API/search/v1/search/?page='+page+'&per_page='+results_per_page,
	    headers: {
		'Content-Type': 'application/json',
		'federated-proxy-base-url': uri,
		'app-id': appId,
		'auth-token': token
				
	    },
	    data: {	      
		'query': criteria,
		'doc_types':['assets'],
		'facets_filters': facetsFilters,
		'filter': {
		    'operator':'AND','terms':[
			{'name':'status','value':'ACTIVE'},
			{'name':'status','value':'ACTIVE'}
		    ]
		},
		'sort':[{'name':'date_created','order':'desc' }]
            }
	}
	return this.$http(req)
    }

}
