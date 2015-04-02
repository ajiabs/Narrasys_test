angular.module('com.inthetelling.story')
	.service('NarrativeHierarchyDataModel', function NarrativeHierarchyDataModel() {
		this.data = [{
			"_id": "551c7e82bca592fa3400011f",
			"description": {
				"en": "TestDescription1"
			},
			"name": {
				"en": "TestName1"
			},
			"path": {
				"en": "testpathfornarrative1"
			},
			"support_url": "TestSupportUrlForNarrative1",
			"customer_id": "528fa665ba4f654bbe000001",
			"guest_access_allowed": false,
			"user_id": "5494786021e37f20f0000001",
			"everyone_group": {
				"_id": "551c7e82bca592fa3400011e",
				"name": {
					"en": "All users"
				},
				"users": []
			},
			"sub_groups": [],
			"timelines": [{
				"_id": "551c7effbca592b173000125",
				"sort_order": 1,
				"path": {
					"en": "sustainabilitypays"
				},
				"name": {
					"en": "Sustainainability Pays",
					"pt": "This is the portuguese title.",
					"zh": "\u6fc0\u5149, \u9019\u5169\u500b\u5b57\u662f\u751a\u9ebc\u610f\u601dxxxxxx"
				},
				"description": {
					"en": "The Business Case, Episode 2",
					"zh": "\u5546\u696d\u6848\u4f8b\uff0c\u4e8c\u90e8\u66f2"
				},
				"hidden": false,
				"episode_segments": [{
					"_id": "551c7effbca592b173000126",
					"sort_order": 0,
					"start_time": 0.0,
					"end_time": 387.970666,
					"episode_id": "551c7effbca592b173000124"
				}, {
					"_id": "551c7ed0bca59228fc000123",
					"sort_order": 0,
					"start_time": 0.0,
					"end_time": 152.694082,
					"episode_id": "551c7ecfbca59228fc000121"
				}, {
					"_id": "551c7f4abca592b173000129",
					"sort_order": 0,
					"start_time": 0.0,
					"end_time": 770.110813,
					"episode_id": "551c7f4abca592b173000127"
				}]
			}, {
				"_id": "551c7ecfbca59228fc000122",
				"sort_order": 0,
				"path": {
					"en": "managingconsumercredit"
				},
				"name": {
					"en": "Advantages and Disadvantages of Consumer Credit"
				},
				"description": {
					"en": "Module 1: Managing Consumer Credit"
				},
				"hidden": false,
				"episode_segments": [{
					"_id": "551c7ed0bca59228fc000123",
					"sort_order": 0,
					"start_time": 0.0,
					"end_time": 152.694082,
					"episode_id": "551c7ecfbca59228fc000121"
				}]
			}, {
				"_id": "551c7f4abca592b173000128",
				"sort_order": 2,
				"path": {
					"en": "testepisode3"
				},
				"name": {
					"en": "Episode 3"
				},
				"description": {
					"en": "testEpisode3"
				},
				"hidden": false,
				"episode_segments": [{
					"_id": "551c7f4abca592b173000129",
					"sort_order": 0,
					"start_time": 0.0,
					"end_time": 770.110813,
					"episode_id": "551c7f4abca592b173000127"
				}]
			}]
		}];
		this.findNarrativeByPath = function (Id) {
			// find the item that matches that id
console.log('find Narrative');
			var list = $.grep(this.data, function (element, index) {
				return (element.path.en == Id);
			});
			if (list.length === 0) {
				return {};
			}

console.log('found Narrative');
			// even if list contains multiple items, just return first one
			return list[0];
		};
	});
