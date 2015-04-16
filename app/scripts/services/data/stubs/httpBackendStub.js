//BackendStub will intercept requests that go through $resource or $http.  Leverages DataModels for easy fakes.
//TODO: if we don't end up using this for backendless / disconnected development, then these files (in stubs) should
// move to the test folder.  They make sense here only if they are actually used in dev.  
//TODO: grunt build include/exclude these files in dev/prod respectively
//TODO: consider breaking up BackendStub into multiple stubs by domain (e.g. AssetBackendStub, etc)
angular.module('com.inthetelling.story')
	.service('BackendStub', function BackendStub(config, DataModelUtils, UserDataModel, AssetDataModel, LayoutDataModel, StyleDataModel, TemplateDataModel, EpisodeDataModel, ContainerDataModel, EventUserActionDataModel, NarrativeDataModel, NarrativeHierarchyDataModel, CustomerDataModel, EpisodeSegmentDataModel, EpisodeSegmentExpandedDataModel, EpisodeUserMetricDataModel, EventDataModel) {
		var svc = {};
		svc.StubIt = function (backend, ise2e) {
			console.log('url', config.apiDataBaseUrl);


			//TODO: move DataModelUtils instantiation here for each domain. load the data for each and use throughout this scope.
			//  Also, make DataModelUtils instance able. :)

			backend.whenGET(/\/show_user/)
				.respond(function (method, url, data) {

					var userid = "5494786021e37f20f0000004";
					DataModelUtils.setData(UserDataModel.data);
					var user = DataModelUtils.findOne(userid);
					return [200, user, {}];
				});

			var templateByIdRegex = /\/v1\/template\/(\w+)/
			backend.whenGET(templateByIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = templateByIdRegex.exec(url);
					var templateid = matches[1];
					DataModelUtils.setData(TemplateDataModel.data);
					var template = DataModelUtils.findOne(templateid);
					return [200, template, {}];
				});
			backend.whenGET(/\/v1\/templates/)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					DataModelUtils.setData(TemplateDataModel.data);
					var templates = DataModelUtils.findAll();

					return [200, templates, {}];
				});

			var layoutByIdRegex = /\/v1\/layouts\/(\w+)/
			backend.whenGET(layoutByIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = layoutByIdRegex.exec(url);
					var layoutid = matches[1];
					DataModelUtils.setData(LayoutDataModel.data);
					var layout = DataModelUtils.findOne(layoutid);
					return [200, layout, {}];
				});
			backend.whenGET(/\/v1\/layouts/)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					DataModelUtils.setData(LayoutDataModel.data);
					var layouts = DataModelUtils.findAll();

					return [200, layouts, {}];
				});
			var styleByIdRegex = /\/v1\/styles\/(\w+)/
			backend.whenGET(styleByIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = styleByIdRegex.exec(url);
					var styleid = matches[1];
					DataModelUtils.setData(StyleDataModel.data);
					var style = DataModelUtils.findOne(styleid);

					return [200, style, {}];
				});
			backend.whenGET(/\/v1\/styles/)
				.respond(function (method, url, data) {
					DataModelUtils.setData(StyleDataModel.data);
					var styles = DataModelUtils.findAll();
					return [200, styles, {}];
				});
			var eventByIdRegex = /\/v3\/episodes\/(\w+)\/events\/(\w+)$/
			backend.whenGET(eventByIdRegex)
				.respond(function (method, url, data) {
					var matches = eventByIdRegex.exec(url);
					var episodeid = matches[1];
					var eventid = matches[2];

					//TODO: extend to support findOneByEventId
					DataModelUtils.setData(EventDataModel.data);
					var event = DataModelUtils.findOne(eventid);

					return [200, event, {}];
				});
			var eventsAllByEpisodeRegex = /\/v3\/episodes\/(\w+)\/events$/
			backend.whenGET(eventsAllByEpisodeRegex)
				.respond(function (method, url, data) {
					var matches = eventsAllByEpisodeRegex.exec(url);
					var episodeid = matches[1];
					DataModelUtils.setData(EventDataModel.data);
					
				  var events = DataModelUtils.findMany({episode_id:episodeid});
					//var events = DataModelUtils.findAll();
					return [200, events, {}];
				});
				//TODO: do this in one regex. with above . e.g. episodes(?:\_segments) or whatever optional match is in js regex
			var eventBySegmentIdRegex = /\/v3\/episode_segments\/(\w+)\/events\/(\w+)$/
			backend.whenGET(eventBySegmentIdRegex)
				.respond(function (method, url, data) {
					var matches = eventBySegmentIdRegex.exec(url);
					var episodeid = matches[1];
					var eventid = matches[2];

					//TODO: extend to support findOneByEventId
					DataModelUtils.setData(EventDataModel.data);
					var event = DataModelUtils.findOne(eventid);
					return [200, event, {}];
				});
			var eventsAllByEpisodeSegmentRegex = /\/v3\/episode_segments\/(\w+)\/events$/
			backend.whenGET(eventsAllByEpisodeSegmentRegex)
				.respond(function (method, url, data) {
					var matches = eventsAllByEpisodeSegmentRegex.exec(url);
					var segmentid = matches[1];

					DataModelUtils.setData(EpisodeSegmentExpandedDataModel.data);
					var episode_segment = DataModelUtils.findOne(segmentid);
					var episode_id = episode_segment.episode.parent_id;
					DataModelUtils.setData(EventDataModel.data);
					var events = DataModelUtils.findMany({episode_id:episode_id});
					return [200, events, {}];
				});


			var eventUserActionsRegex = /\/v2\/events\/(\w+)\/event_user_actions$/
			backend.whenGET(eventUserActionsRegex)
				.respond(function (method, url, data) {
					var matches = eventUserActionsRegex.exec(url);
					var episodeid = matches[1];
					var eventid = matches[2];
					DataModelUtils.setData(EventUserActionDataModel.data);
					var event = DataModelUtils.findAll();
					return [200, event, {}];
				});

			var episodeEventUserActionsRegex = /\/v2\/episodes\/(\w+)\/event_user_actions$/
			backend.whenGET(episodeEventUserActionsRegex)
				.respond(function (method, url, data) {
					var matches = episodeEventUserActionsRegex.exec(url);
					var episodeid = matches[1];
					var eventid = matches[2];
					DataModelUtils.setData(EventUserActionDataModel.data);
					var event = DataModelUtils.findAll();
					return [200, event, {}];
				});



			var episodeByIdRegex = /\/v3\/episodes\/(\w+)$/
			backend.whenGET(episodeByIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = episodeByIdRegex.exec(url);
					var episodeid = matches[1];
					DataModelUtils.setData(EpisodeDataModel.data);
					var episode = DataModelUtils.findOne(episodeid);

					return [200, episode, {}];
				});
			backend.whenGET(/\/v3\/episodes$/)
				.respond(function (method, url, data) {
					DataModelUtils.setData(EpisodeDataModel.data);
					var episodes = DataModelUtils.findAll();

					return [200, episodes, {}];
				});

			var containerByIdRegex = /\/v3\/containers\/(\w+)/
			backend.whenGET(containerByIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = containerByIdRegex.exec(url);
					var containerid = matches[1];
					DataModelUtils.setData(ContainerDataModel.data);
					var container = DataModelUtils.findOne(containerid);

					return [200, [container], {}]; //containers returns an array, even when by id, so we'll match the backend
				});

			backend.whenGET(/\/v3\/containers/)
				.respond(function (method, url, data) {
					DataModelUtils.setData(EpisodeDataModel.data);
					var containers = DataModelUtils.findAll();
					return [200, containers, {}];
				});


			var assetsByContainerIdRegex = /\/v1\/containers\/(\w+)\/assets/
			backend.whenGET(assetsByContainerIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = assetsByContainerIdRegex.exec(url);
					var containerid = matches[1];
					//TODO: AssetDataModel needs to be extended to have FindByContainerId
					DataModelUtils.setData(AssetDataModel.data);
					var assets = DataModelUtils.findAll();
					var files = {};
					files.files = assets;

					return [200, files, {}]; //containers returns an array, even when by id, so we'll match the backend
				});
			var narrativeByIdRegex = /\/v3\/narratives\/(\w+)\/resolve/
			backend.whenGET(narrativeByIdRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = narrativeByIdRegex.exec(url);
					var narrativePathOrId = matches[1];
					//TODO: AssetDataModel needs to be extended to have FindByContainerId
					//DataModelUtils.setData(NarrativeHierarchyDataModel.data);
					var narrativeFull = NarrativeHierarchyDataModel.findNarrativeByPath(narrativePathOrId);
					//var narrativeFull = DataModelUtils.findOne(narrativePathOrId);
					return [200, narrativeFull, {}];
				});

			var narrativesAllRegex = /\/v3\/narratives/
			backend.whenGET(narrativesAllRegex)
				.respond(function (method, url, data) {
					DataModelUtils.setData(NarrativeDataModel.data);
					var narratives = DataModelUtils.findAll();
					return [200, narratives, {}];
				});

			var episodeSegmentResolveRegex = /\/v3\/episode_segments\/(\w+)\/resolve/
			backend.whenGET(episodeSegmentResolveRegex)
				.respond(function (method, url, data) {
					// parse the matching URL to pull out the id (/games/:id)
					var matches = episodeSegmentResolveRegex.exec(url);
					var segmentid = matches[1];
					//TODO: AssetDataModel needs to be extended to have FindByContainerId
					DataModelUtils.setData(EpisodeSegmentExpandedDataModel.data);
					var episodeSegmentFull = DataModelUtils.findOne(segmentid);
					//var narrativeFull = DataModelUtils.findOne(narrativePathOrId);
					return [200, episodeSegmentFull, {}];
				});


			var customersAllRegex = /\/v3\/customers/
			backend.whenGET(customersAllRegex)
				.respond(function (method, url, data) {
					DataModelUtils.setData(CustomerDataModel.data);
					var customers = DataModelUtils.findAll();
					return [200, customers, {}]; //containers returns an array, even when by id, so we'll match the backend
				});
			var episodeUserMetricsRegex = /\/v2\/episodes\/(\w+)\/episode_user_metrics/
			backend.whenPOST(episodeUserMetricsRegex)
				.respond(function (method, url, data) {
					var params = angular.fromJson(data);
					var matches = episodeUserMetricsRegex.exec(url);
					var episodeid = matches[1];
					DataModelUtils.setData(EpisodeUserMetricDataModel.data);
					var metric = DataModelUtils.addOne(params);
					return [201, metric, {
						Location: '/v2/episodes/' + episodeid + '/episode_user_metrics/' + metric._id
					}];
				});


			if (ise2e) {

				backend.whenGET('/v1/get_nonce')
					.passThrough();


				backend.whenPOST(/\/auth\/identity\/callback/)
					.passThrough();
				//					.respond(function (method, url, data) {
				//						//TODO: add a DataModel for "session" and "auth", this is temporary...
				//						// A fine line between a helpful backendless development env and constantly changing the backend. 
				//						// Backendless dev, only where stable apis exist... that said, we'll still use the httpBackendStub and models for local testing
				//						console.log(method);
				//						console.log(url);
				//						var session = {"session_key":"_tellit-api_session","cookie":null,"access_token":"4qf5mpyrsqT5MzCjkPzn","form_authenticity_token":"d+nBLBqObrsxo1QNCb/aiSNaWuWTRZvPLMBweo+MthI=","nonce":"gsEgcADKKRfCpKHufLDpnA"}
				//						return [200, session, {}];
				//					});



				backend.whenGET(/\/(?!(v1|v3)\/.*)/)
					.passThrough();
			}

		};
		return svc;
	});


// If we are "local" then we will mock $httpBackend, capturing routes and returning data
(function (ng) {
	if (!document.URL.match(/\?nobackend$/)) {
		console.log('Normal dev, no stub backend');
		return; // nothing, not using stubbed backend
	}
	console.log('====== USING STUBBED BACKEND ======');
	initStubbedBackend();

	function initStubbedBackend() {
		console.log('initializing stubbed backend');
		ng.module('com.inthetelling.story')
			.config(function ($provide) {
				$provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
			})
			.run(function ($httpBackend, BackendStub, config, DataModelUtils, UserDataModel, AssetDataModel) {
				BackendStub.StubIt($httpBackend, true);
			});
	}

})(angular);
