/**
 * Created by githop on 6/7/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('selectService', selectService);

	function selectService(authSvc, modelSvc) {
		var _userHasRole = authSvc.userHasRole;

		//select opts map
		var _select = {
			video: [],
			display: [],
			imagePosition: [],
			imagePin:[]
		};
		//use visibility map with getVisibility() and component directives
		var _visibility = {
			templateSelect: true,
			imageUpload: false,
			display: false,
			videoPosition: false,
			titleField: true,
			speakerField: true
		};

		//moved into a map because we will need to use this
		//when we are handing updates on background images.
		var _scenes = {
			centered: 'templates/scene/centered.html',
			centeredPro: 'templates/scene/centeredPro.html',
			'1col': 'templates/scene/1col.html',
			'2colL': 'templates/scene/2colL.html',
			'2colR': 'templates/scene/2colR.html',
			mirroredTwoCol: 'templates/scene/mirrored-twocol.html',
			cornerV: 'templates/scene/cornerV.html',
			centerVV: 'templates/scene/centerVV.html',
			centerVVMondrian: 'templates/scene/centerVV-Mondrian.html',
			cornerH: 'templates/scene/cornerH.html',
			pip: 'templates/scene/pip.html'
		};

		var _imageFieldVisibility = _partialVis('imageUpload');
		var _displaySelectVisibility = _partialVis('display');
		var _videoPositionSelectVisibility = _partialVis('videoPosition');
		var _titleFieldVisibility = _partialVis('titleField');
		var _speakerFieldVisibility = _partialVis('speakerField');
		var _templateSelectVisibility = _partialVis('templateSelect');

		return {
			showTab: showTab,
			onSelectChange: onSelectChange,
			getTemplates: getTemplates,
			getVisibility: getVisibility,
			getSelectOpts: getSelectOpts
		};

		function _setVisibility(prop, bool) {
			_visibility[prop] = bool;
		}

		function _partialVis(prop) {
			return function (bool) {
				return _setVisibility(prop, bool);
			};
		}

		//not the display name, but the key of the scene map as string.
		function _getSceneName(scene) {
			return Object.keys(_scenes).filter(function(key) {
				return _scenes[key] === scene.templateUrl;
			})[0];
		}

		function getSelectOpts(type) {
			return _select[type];
		}

		function getVisibility(prop) {
			return _visibility[prop];
		}

		function getTemplates(type) {
			switch(type) {
				case 'scene':
					_displaySelectVisibility(false);
					_videoPositionSelectVisibility(false);
					_templateSelectVisibility(true);
					return [
						{url: _scenes.centered, name: 'Centered'},
						{url: _scenes.centeredPro, name: 'Centered Pro' },
						{url: _scenes['1col'], name: 'One Column'},
						{url: _scenes['2colL'], name: 'Two Columns'},
						{url: _scenes['2colR'], name: 'Two Columns (mirrored)'},
						{url: _scenes.mirroredTwoCol, name: '2Col (v2 mirrored)'},
						{url: _scenes.cornerV ,name: 'Vertical'},
						{url: _scenes.centerVV, name: 'Vertical Pro'},
						{url: _scenes.centerVVMondrian, name: 'Vertical Pro Mondrian'},
						{url: _scenes.cornerH, name: 'Horizontal'},
						{url: _scenes.pip, name: 'Picture-in-picture'}
					];
				case 'transcript':
					_speakerFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						// {url: 'templates/item/transcript.html', name: 'Transcript'},
						{url: 'templates/item/transcript-withthumbnail.html', name: 'Transcript'},
						// {url: 'templates/item/transcript-withthumbnail-alt.html', name: 'Transcript with thumbnail B'}
					];
				case 'annotation':
					_speakerFieldVisibility(false);
					_titleFieldVisibility(false);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/item/text-h1.html', name: 'Header 1'},
						{url: 'templates/item/text-h2.html', name: 'Header 2'},
						{url: 'templates/item/pullquote.html', name: 'Pullquote'},
						{url: 'templates/item/pullquote-noattrib.html', name: 'Pullquote with attribution'},
						{url: 'templates/item/text-transmedia.html', name: 'Long text (as transmedia)'},
						{url: 'templates/item/text-definition.html', name: 'Definition (as transmedia)'}
					];
				case 'link':
					_displaySelectVisibility(true);
					_videoPositionSelectVisibility(false);
					_imageFieldVisibility(true);
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					var linkTemplates = [
						{url: 'templates/item/link.html', name: 'Link'},
						{url: 'templates/item/link-withimage-notitle.html', name: 'Link with image / hide title'},
						{url: 'templates/item/link-modal-thumb.html', name: 'Link Modal'},
						// {url: 'templates/item/link-withimage.html', name: 'Link with image'},
						{url: 'templates/item/link-embed.html', name: 'Embedded Link'}
					];
					if (_userHasRole('admin')) {
						linkTemplates.splice(3, 0, {url: 'templates/item/link-descriptionfirst.html', name: 'Link w/ description first'});
					}
					return linkTemplates;
				case 'image':
					_imageFieldVisibility(true);
					_displaySelectVisibility(false);
					_videoPositionSelectVisibility(false);
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					var imgTemplates = [
						{url: 'templates/item/image-plain.html', name: 'Plain image'},
						{url: 'templates/item/image-inline-withtext.html', name: 'Inline Image with text'},
						{url: 'templates/item/image-caption-sliding.html', name: 'Image with sliding caption'},
						{url: 'templates/item/image-thumbnail.html', name: 'Image thumbnail'},
						{url: 'templates/item/image-fill.html', name: 'Overlay or background fill'}
					];
					if (_userHasRole('admin')) {
						imgTemplates.push(
							{url: 'templates/item/image.html', name: 'Linked Image'},
							{url: 'templates/item/image-inline.html', name: 'Inline Image'},
							{url: 'templates/item/image-caption.html', name: 'Image with caption'}
						);
					}
					return imgTemplates;
				case 'file':
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/item/file.html', name: 'Uploaded File'}
					];
				case 'question':
					_displaySelectVisibility(true);
					_imageFieldVisibility(true);
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/item/question-mc.html', name: 'Default question display'},
						{url: 'templates/item/question-mc-image-right.html', name: 'Question with image right'}
						// {url: 'templates/item/question-mc-image-left.html', name: 'Question with image left'}
					];
				case 'chapter':
					//chapters have no template, but need to do side-effects
					_titleFieldVisibility(true);
					break;
			}
		}

		// function onItemFormUpdate(itemForm) {
		//
		// }

		function onSelectChange(item) {
			_displaySelectVisibility(false);
			switch(item.producerItemType) {
				case 'scene':
					_select.display = [
						{value: '', name: 'Show all content items, highlight current ones'},
						{value: 'showCurrent', name: 'Show only current items'}
					];
					switch(item.templateUrl) {
						case 'templates/scene/1col.html':
							if (_userHasRole('admin')) { _displaySelectVisibility(true); }
						/* falls through */
						case 'templates/scene/centered.html':
						case 'templates/scene/centeredPro.html':
							_videoPositionSelectVisibility(false);
							_select.video = [
								{value: 'inline', name: 'Inline'},
								{value: '', name: 'Centered'}
							];
							item.layouts[0] = '';
							item.layouts[1] = 'showCurrent';
							break;
						case 'templates/scene/2colL.html':
						case 'templates/scene/2colR.html':
						case 'templates/scene/cornerH.html':
						case 'templates/scene/cornerV.html':
						case 'templates/scene/centerVV.html':
						case 'templates/scene/centerVV-Mondrian.html':
						case 'templates/scene/pip.html':
						case 'templates/scene/mirrored-twocol.html':
							_videoPositionSelectVisibility(true);
							_select.video = [
								{value: 'videoLeft', name: 'Video on Left'},
								{value: 'videoRight', name: 'Video on Right'}
							];
							item.layouts[0] = 'videoLeft';

							if (/2col/.test(item.templateUrl)) {

								item.layouts[1] = '';
							} else {
								item.layouts[1] = 'showCurrent';
							}

							if (/pip|corner/.test(item.templateUrl)) {
								_displaySelectVisibility(true);
							}

							break;
					}
					break;
				case 'link':
					_displaySelectVisibility(true);
					_imageFieldVisibility(true);
					_templateSelectVisibility(true);
					if (item.stop === true) {
						item.layouts[0] = 'windowFg';
					} else {
						item.layouts[0] = 'inline';
					}

					//if they attach an image, and add a link that we can embed in an iframe,
					//set their template to link-modal
					// if (item.noEmbed === false && item.mixedContent === false && existy(item.link_image_id)) {
					// 	item.templateUrl = 'templates/item/link-modal-thumb.html';
					// 	_templateSelectVisibility(false);
					// 	console.log('set to linkModalThumb!');
					// 	return;
					// }

					switch(item.templateUrl) {
						case 'templates/item/link.html':
						case 'templates/item/link-withimage.html':
						case 'templates/item/link-withimage-notitle.html':
						case 'templates/item/link-modal-thumb.html':
							_imageFieldVisibility(true);
							break;
						case 'templates/item/link-descriptionfirst.html':
						case 'templates/item/link-embed.html':
							_imageFieldVisibility(false);
							break;
					}
					break;
				case 'transcript':
					_displaySelectVisibility(false);
					item.layouts[0] = 'inline';
					break;
				case 'annotation':
					item.layouts[0] = 'inline';
					switch(item.templateUrl) {
						case 'templates/item/text-h1.html':
						case 'templates/item/text-h2.html':
							_speakerFieldVisibility(false);
							_titleFieldVisibility(false);
							break;
						case 'templates/item/pullquote-noattrib.html':
						case 'templates/item/pullquote.html':
							_speakerFieldVisibility(true);
							_titleFieldVisibility(false);
							break;
						case 'templates/item/text-transmedia.html':
						case 'templates/item/text-definition.html':
							_speakerFieldVisibility(false);
							_titleFieldVisibility(true);
							break;
					}
					if (item.stop === true) {
						item.layouts[0] = 'windowFg';
					}
					break;
				case 'question':
					// item.layouts[0] = 'windowFg';
					//need a little feedback as the spreadsheet is a little confusing for this
					//section
					break;

				case 'image':
					//will set to true in image fill
					_displaySelectVisibility(false);
					var _currentScene = modelSvc.scene(item.scene_id);
					console.log('curScene name', _getSceneName(_currentScene));

					_select.display = [
						{value: 'windowBg', name: 'Window background'},
						{value: 'mainBg', name: 'Main content pane background'},
						{value: 'altBg', name: 'Secondary content pane background'},
						{value: 'mainFg', name: 'Main content pane foreground'},
						{value: 'altFg', name: 'Secondary content pane foreground'},
						{value: 'videoOverlay', name: 'Video overlay'},
					];



					switch(item.templateUrl) {
						case 'templates/item/image-plain.html':
						case 'templates/item/image-inline-withtext.html':
						case 'templates/item/image-caption-sliding.html':
						case 'templates/item/image.html':
							item.layouts[0] = 'inline';
							break;
						case 'templates/item/image-fill.html':
							_displaySelectVisibility(true);
							_select.imagePosition = [
								{value: '', name: 'Fit'},
								{value: 'cover', name: 'Cover'},
								{value: 'contain', name: 'Contain'},
								{value: 'fill', name: 'Fill and stretch'},
							];
							_select.imagePin = [
								{value: 'tl', name: 'Top left'},
								{value: 'tr', name: 'Top right'},
								{value: 'bl', name: 'Bottom left'},
								{value: 'br', name: 'Bottom right'},
							];
							item.layouts[1] = item.layouts[1] || 'windowBg';
					}
					if (item.stop === true) {
						item.layouts[0] = 'windowFg';
					}
					break;
			}
		}

		function showTab(itemType, tabTitle) {
			switch (itemType) {
				case 'scene':
					switch(tabTitle) {
						case 'Item':
							return false;
						case 'Style':
							return true;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'transcript':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return false;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'annotation':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return false;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'link':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return false;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'image':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return false;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'file':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return false;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'question':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return true;
						case 'Customize':
							return _userHasRole('admin');
					}
					break;
				case 'chapter':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return false;
						case 'Customize':
							return false;
					}
			}
		}
	}

})();
