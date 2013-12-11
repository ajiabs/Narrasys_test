'use strict';

describe('Service: modelFactory', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.player'));

	// instantiate service
	var modelFactory;
	beforeEach(inject(function (_modelFactory_) {
		modelFactory = _modelFactory_;
	}));

	// prepare data objects
	var episodeData,
		sceneData,
		transcriptItemData,
		linkItemData,
		imageItemData;
	beforeEach(function() {
		episodeData = {
			title: "Title",
			category: "Category",
			cover: "Cover",
			template: "Template",
			videos: {
				webm: "Webm",
				mpeg4: "Mpeg4"
			}
		};
		sceneData = {
			type: "Type",
			title: "Title",
			description: "Description",
			template: "Template",
			start: "Start",
			end: 100,
			src: 200
		};
		transcriptItemData = {
			// base
			type: "transcript",
			category: "Category",
			start: 100,
			end: 200,
			template: "Template",
			// transcript
			annotation: "Annotation",
			author: {
				name: "Name",
				src: "Src"
			}
		};
		linkItemData = {
			// base
			type: "link",
			category: "Category",
			start: 100,
			end: 200,
			template: "Template",
			// link
			title: "Title",
			description: "Description",
			src: "Src",
			href: "Href"
		};
		imageItemData = {
			// base
			type: "image",
			category: "Category",
			start: 100,
			end: 200,
			template: "Template",
			// image
			title: "Title",
			description: "Description",
			src: "Src"
		};
	});

	it('should create an episode model', function () {
		var episodeModel = modelFactory.createEpisodeModel(episodeData);
		expect(episodeModel.title).toEqual(episodeData.title);
		expect(episodeModel.category).toEqual(episodeData.category);
		expect(episodeModel.coverUrl).toEqual(episodeData.cover);
		expect(episodeModel.templateUrl).toEqual(episodeData.template);
		expect(episodeModel.videos.webm).toEqual(episodeData.videos.webm);
		expect(episodeModel.videos.mpeg4).toEqual(episodeData.videos.mpeg4);
		expect(episodeModel.scenes).toEqual([]);
	});

	it('should create a scene model', function () {
		var sceneModel = modelFactory.createSceneModel(sceneData);
		expect(sceneModel.type).toEqual(sceneData.type);
		expect(sceneModel.title).toEqual(sceneData.title);
		expect(sceneModel.description).toEqual(sceneData.description);
		expect(sceneModel.templateUrl).toEqual(sceneData.template);
		expect(sceneModel.startTime).toEqual(sceneData.start);
		expect(sceneModel.endTime).toEqual(sceneData.end);
		expect(sceneModel.title).toEqual(sceneData.title);
		expect(sceneModel.thumbnail).toEqual(sceneData.src);
		expect(sceneModel.isActive).toBe(false);
		expect(sceneModel.wasActive).toBe(false);
		expect(sceneModel.items).toEqual([]);
	});

	it('should create a transcript item model', function () {
		var itemModel = modelFactory.createItemModel(transcriptItemData);
		// base
		expect(itemModel.type).toEqual(transcriptItemData.type);
		expect(itemModel.category).toEqual(transcriptItemData.category);
		expect(itemModel.startTime).toEqual(transcriptItemData.start);
		expect(itemModel.endTime).toEqual(transcriptItemData.end);
		expect(itemModel.templateUrl).toEqual(transcriptItemData.template);
		// transcript
		expect(itemModel.authorName).toEqual(transcriptItemData.author.name);
		expect(itemModel.authorThumbSrc).toEqual(transcriptItemData.author.src);
		expect(itemModel.annotation).toEqual(transcriptItemData.annotation);
	});

	it('should create a link item model', function () {
		var itemModel = modelFactory.createItemModel(linkItemData);
		// base
		expect(itemModel.type).toEqual(linkItemData.type);
		expect(itemModel.category).toEqual(linkItemData.category);
		expect(itemModel.startTime).toEqual(linkItemData.start);
		expect(itemModel.endTime).toEqual(linkItemData.end);
		expect(itemModel.templateUrl).toEqual(linkItemData.template);
		// transcript
		expect(itemModel.title).toEqual(linkItemData.title);
		expect(itemModel.description).toEqual(linkItemData.description);
		expect(itemModel.thumbSrc).toEqual(linkItemData.src);
		expect(itemModel.source).toEqual(linkItemData.href);
	});

	it('should create an image item model', function () {
		var itemModel = modelFactory.createItemModel(imageItemData);
		// base
		expect(itemModel.type).toEqual(imageItemData.type);
		expect(itemModel.category).toEqual(imageItemData.category);
		expect(itemModel.startTime).toEqual(imageItemData.start);
		expect(itemModel.endTime).toEqual(imageItemData.end);
		expect(itemModel.templateUrl).toEqual(imageItemData.template);
		// transcript
		expect(itemModel.title).toEqual(imageItemData.title);
		expect(itemModel.description).toEqual(imageItemData.description);
		expect(itemModel.source).toEqual(imageItemData.src);
	});

});

