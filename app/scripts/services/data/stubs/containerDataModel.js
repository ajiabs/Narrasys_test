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
			}, {
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
			}, {
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
			},

			{
				"_id": "537123762442bd8432000003",
				"parent_id": "5371236b2442bd8432000002",
				"sort_order": 0,
				"name": {
					"en": "Managing Consumer Credit"
				},
				"customer_id": "528fa665ba4f654bbe000001",
				"keywords": {
					"en": []
				},
				"episodes": ["537123762442bd8432000004"]
			}, {
				"_id": "533aec172442bdd34c000002",
				"parent_id": "533aec0a2442bdd34c000001",
				"sort_order": 0,
				"name": {
					"en": "Sustainability Pays"
				},
				"customer_id": "528fa665ba4f654bbe000001",
				"keywords": {
					"en": []
				},
				"episodes": ["533aec182442bdd34c000003"]
			}, {
				"_id": "533aec0a2442bdd34c000001",
				"parent_id": "533aebfe2442bd2613000003",
				"sort_order": 0,
				"name": {
					"en": "The Business Case"
				},
				"customer_id": "528fa665ba4f654bbe000001",
				"keywords": {
					"en": []
				},
				"episodes": [],
				"children": [{
					"_id": "533aec172442bdd34c000002",
					"parent_id": "533aec0a2442bdd34c000001",
					"sort_order": 0,
					"name": {
						"en": "Sustainability Pays"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": ["533aec182442bdd34c000003"]
				}, {
					"_id": "5346a4662442bd6c85000001",
					"parent_id": "533aec0a2442bdd34c000001",
					"sort_order": 0,
					"name": {
						"en": "Sustainability Pays sXs"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": ["5346a4672442bd6c85000002"]
				}, {
					"_id": "5499957521e37f7ddc000003",
					"parent_id": "533aec0a2442bdd34c000001",
					"sort_order": 0,
					"name": {
						"en": "Daniel Test One"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": [],
					"episodes": ["5499957521e37f7ddc000004"]
				}]
			}, {
				"_id": "533aebfe2442bd2613000003",
				"parent_id": "528fa666ba4f654bbe000002",
				"sort_order": 0,
				"name": {
					"en": "SLIC"
				},
				"customer_id": "528fa665ba4f654bbe000001",
				"keywords": {
					"en": []
				},
				"episodes": [],
				"children": [{
					"_id": "533aec0a2442bdd34c000001",
					"parent_id": "533aebfe2442bd2613000003",
					"sort_order": 0,
					"name": {
						"en": "The Business Case"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": []
				}]
			}, {
				"_id": "528fa666ba4f654bbe000002",
				"parent_id": null,
				"sort_order": 0,
				"name": {
					"en": "Test Customer"
				},
				"customer_id": "528fa665ba4f654bbe000001",
				"keywords": {
					"en": []
				},
				"episodes": [],
				"children": [{
					"_id": "528fa675ba4f654bbe000003",
					"parent_id": "528fa666ba4f654bbe000002",
					"sort_order": 0,
					"name": {
						"en": "Course 1"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": []
				}, {
					"_id": "52d84a3dba4f65effe000001",
					"parent_id": "528fa666ba4f654bbe000002",
					"sort_order": 0,
					"name": {
						"en": "E-Literate TV"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": []
				}, {
					"_id": "533aebfe2442bd2613000003",
					"parent_id": "528fa666ba4f654bbe000002",
					"sort_order": 0,
					"name": {
						"en": "SLIC"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": []
				}, {
					"_id": "5371235c2442bd8432000001",
					"parent_id": "528fa666ba4f654bbe000002",
					"sort_order": 0,
					"name": {
						"en": "Wiley"
					},
					"customer_id": "528fa665ba4f654bbe000001",
					"keywords": {
						"en": []
					},
					"episodes": []
				}]
			}
		];
	});
