angular.module('com.inthetelling.story')
	.service('ContainerDataModel', function ContainerDataModel() {
		this.data = [{
			"_id": "527d078fd72cc3699f000003",
			"parent_id": null,
			"name": {
				"en": "Customer 1"
			},
			"customer_id": "527d078ed72cc3699f000002",
			"keywords": {
				"en": []
			},
			"containers": [],
			"children": [{
				"_id": "528650a8d72cc3e549000002",
				"parent_id": "527d078fd72cc3699f000003",
				"name": {
					"en": "Course 1"
				},
				"customer_id": "527d078ed72cc3699f000002",
				"keywords": {
					"en": []
				},
				"containers": [],
			}]
		}, {
			"_id": "52cb3b65d72cc328be000003",
			"parent_id": null,
			"name": {
				"en": "Test Container"
			},
			"customer_id": "52cb3b65d72cc328be000002",
			"keywords": {
				en: ["keyword1", "keyword2", "keyword3"]
			},
			"containers": []
		},
		{
			"_id": "51d39b60bd526e27b1000004",
			"parent_id": null,
			"name": {
				"en": "Test Container"
			},
			"customer_id": "52cb3b65d72cc328be000002",
			"keywords": {
				en: ["keyword1", "keyword2", "keyword3"]
			},
			"containers": []
		},
		{
			"_id": "537123762442bd8432000003",
			"parent_id": null,
			"name": {
				"en": "Test Container"
			},
			"customer_id": "52cb3b65d72cc328be000002",
			"keywords": {
				en: ["keyword1", "keyword2", "keyword3"]
			},
			"containers": []
		}


];
	});


