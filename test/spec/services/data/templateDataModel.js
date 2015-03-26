angular.module('com.inthetelling.story')
	.service('TemplateDataModel', function TemplateDataModel() {
		this.data = [
    {
        "_id": "5240be41dd4736976c00000d",
        "url": "http://test/template/url",
        "name": "test template",
        "event_type": [],
        "applies_to_episodes": false
    },
    {
        "_id": "5240c9ffdd4736042c00000e",
        "url": "http://example/template/url",
        "name": "example template",
        "event_type": ["Annotation"],
        "applies_to_episodes": false
    }
	];
});


