

angular.module('com.inthetelling.story')
	.service('EpisodeDataModel', function EpisodeDataModel() {
		this.data = [{
			"_id": "51da82dcbd526e960d000001",
			"container_id": "51d39b60bd526e27b1000004",
			"created_at": "2013-07-08T09:14:04Z",
			"title": {
				"en": "example title"
			},
			"description": {
				"en": "example description of this episode"
			},
			"keywords": {
				"en": ["keyword1", "keyword2"]
			},
			"master_asset_id": "5265cc10dd47369f3c000005",
			"style_id": [
				"52eabb31d72cc354cc000045",
				"52eabb31d72cc354cc00004a",
				"52eabb31d72cc354cc00004b",
				"52eabb31d72cc354cc000051",
				"52eabb32d72cc354cc000056"
			],
			"layout_id": "52eabb30d72cc354cc000022",
			"template_id": "52eabb2fd72cc354cc000002",
			"title": "Ruby 101",
			"status": "Published",
			"updated_at": "2013-07-08T09:14:04Z"
		}, {
			"_id": "51da8cb7bd526e05af000002",
			"container_id": "51d39b60bd526e27b1000004",
			"created_at": "2013-07-08T09:56:07Z",
			"master_asset_id": "5265cc10dd47369f3c000005",
			"style_id": null,
			"layout_id": null,
			"template_id": null,
			"title": {
				"en": "Ruby 102"
			},
			"status": "Unublished",
			"updated_at": "2013-07-08T09:56:07Z"
		}];
	});
