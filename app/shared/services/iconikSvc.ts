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
    
    search(appId, token, criteria):{} {
	var req = {
	    method: 'POST',
	    url: '/API/search/v1/search/?per_page=25',
	    headers: {
		'Content-Type': 'application/json',
		'app-id': appId,
		'auth-token': token
	    },
	    data: {	      
		'query': criteria,
		'doc_types':['assets'],
		'facets_filters':[],
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
