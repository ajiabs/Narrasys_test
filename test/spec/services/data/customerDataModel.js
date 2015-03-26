angular.module('com.inthetelling.story')
	.service('CustomerDataModel', function CustomerDataModel() {

		this.data = [{
			"_id": "51d365cdbd526e037d000001",
			"active": true,
			"created_at": "2013-07-02T23:44:13Z",
			"domains": ["cu", "cuboulder", "univcolo "],
			"name": "University of Colorado",
			"create_s3_transcodes": true,
			"guest_access_allowed": true,
			"youtube_allowed": true,
			"login_url": "http://cu.inthetelling.com/",
			"login_via_top_window_only": true,
			"oauth2_message": {
				"en": "Please Choose a login provider"
			},
			"oauth2_providers": [
				"google",
				"facebook",
				"twitter",
				"linkedin",
				"wordpress"
			],
			"updated_at": "2013-07-02T23:44:13Z"
		}, {
			"_id": "51d3834bbd526ebfc6000002",
			"active": false,
			"created_at": "2013-07-03T01:50:03Z",
			"domains": ["gwsb", "gwu"],
			"name": "George Washington University",
			"create_s3_transcodes": true,
			"guest_access_allowed": false,
			"youtube_allowed": false,
			"login_url": "http://gwsb.inthetelling.com/login",
			"login_via_top_window_only": false,
			"updated_at": "2013-07-03T01:50:03Z"
		}];
	});
