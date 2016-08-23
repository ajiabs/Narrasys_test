/**
 * Created by githop on 6/7/16.
 */
(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('selectService', selectService);

	function selectService(authSvc, modelSvc) {
		var _userHasRole = authSvc.userHasRole;

		var _langOpts = [
			{value: 'en', name: 'English', isDisabled: false},
			{value: 'es', name: 'Spanish', isDisabled: false},
			{value: 'zh', name: 'Chinese', isDisabled: false},
			{value: 'pt', name: 'Portuguese', isDisabled: false},
			{value: 'fr', name: 'French', isDisabled: false},
			{value: 'de', name: 'German', isDisabled: false},
			{value: 'it', name: 'Italian', isDisabled: false}
		];

		//select opts map
		var _select = {
			video: [],
			display: [],
			imagePosition: [],
			imagePin: [],
			questionType: [],
			language: _langOpts
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

		var _D1 = {
			a: {value: 'showCurrent', name: 'show only current transmedia items'},
			b: {value: '', name: 'Show all transmedia items, highlight current ones'}
		};
		var _D2 = {
			a: {value: 'showCurrent', name: 'Show only current text items'},
			b: {value: '', name: 'Show all text items, highlight current ones'}
		};
		var _D3 = {
			a: {value: 'showCurrent', name: 'Show only current items'},
			b: {value: '', name: 'Show all items, highlight current ones'}
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
			return Object.keys(_scenes).filter(function (key) {
				return _scenes[key] === scene.templateUrl;
			})[0];
		}

		function _setAvailableImageOptsForLayout(sceneType, item, itemForm) {
			//if we are set to the default layout,
			//overwrite it back to an empty array
			var isInline = item.layouts[0] === 'inline';
			switch(sceneType) {
				case 'centeredPro':
					_displaySelectVisibility(false);
				/* falls through */
				case '1col':
				case 'centered':
					var isAdmin = _userHasRole('admin');
					_displaySelectVisibility(true);
					_select.display = [
						{value: 'windowBg', name: 'Full Window background', isDisabled: false},
						{value: 'videoOverlay', name: 'Video Overlay', isDisabled: false},
						{value: 'mainBg', name: 'Text pane (main) background', isDisabled: !isAdmin},
						{value: 'mainFg', name: 'Text pane foreground', isDisabled: !isAdmin},
						{value: 'altBg', name: 'Transmedia pane (alt) background', isDisabled: !isAdmin},
						{value: 'altFg', name: 'Transmedia pane foreground', isDisabled: !isAdmin},
					];
					if (isInline) {
						item.layouts = ['windowBg'];
					}
					itemForm.position = itemForm.position || 'fill'; //P1-A
					item.layouts = item.layouts || ['windowBg'];
					break;
				case '2colL':
				case '2colR':
				case 'mirroredTwoCol':
					_displaySelectVisibility(true);
					_select.display = [
						{value: 'windowBg', name: 'Full Window background', isDisabled: false},
						{value: 'videoOverlay', name: 'Video Overlay', isDisabled: false},
						{value: 'mainBg', name: 'Text pane (main) background', isDisabled: false},
						{value: 'mainFg', name: 'Text pane foreground', isDisabled: false},
						{value: 'altBg', name: 'Transmedia pane (alt) background', isDisabled: false},
						{value: 'altFg', name: 'Transmedia pane foreground', isDisabled: false}
					];

					if (isInline) {
						item.layouts = ['mainBg'];
					}
					itemForm.position = itemForm.position || 'fill'; //P1-A
					item.layouts = item.layouts || ['mainBg'];
					break;
				case 'cornerV':
				case 'centerVV':
					_displaySelectVisibility(true);
					_select.display = [
						{value: 'windowBg', name: 'Full Window background', isDisabled: false},
						{value: 'videoOverlay', name: 'Video Overlay', isDisabled: false},
						{value: 'mainBg', name: 'Text pane (main) background', isDisabled: true},
						{value: 'mainFg', name: 'Text pane foreground', isDisabled: true},
						{value: 'altBg', name: 'Transmedia pane (alt) background', isDisabled: false},
						{value: 'altFg', name: 'Transmedia pane foreground', isDisabled: false}
					];

					if (isInline) {
						item.layouts = ['altBg'];
					}

					itemForm.position = itemForm.position || 'fill'; //P1-A
					item.layouts = item.layouts || ['altBg'];
					break;
				case 'cornerH':
				case 'pip':
					_displaySelectVisibility(false);
					itemForm.position = itemForm.position || 'tl';
					item.layouts = ['altBg'];
					break;
				case 'centerVVMondrian':
					_select.display = [
						{value: 'windowBg', name: 'Full Window background', isDisabled: true},
						{value: 'videoOverlay', name: 'Video Overlay', isDisabled: false},
						{value: 'mainBg', name: 'Text pane (main) background', isDisabled: false},
						{value: 'mainFg', name: 'Text pane foreground', isDisabled: false},
						{value: 'altBg', name: 'Transmedia pane (alt) background', isDisabled: true},
						{value: 'altFg', name: 'Transmedia pane foreground', isDisabled: true}
					];

					if (isInline) {
						item.layouts = ['mainBg'];
					}
					item.layouts = item.layouts || ['mainBg'];
					itemForm.position = itemForm.position || 'fill';
					break;
			}

			if (itemForm.position) {
				item.styles = [itemForm.position];
			}
		}

		function _setSceneDisplayOpts(item) {
			_displaySelectVisibility(true);
			switch(item.templateUrl) {
				case 'templates/scene/1col.html':
					if (_userHasRole('admin')) {
						_displaySelectVisibility(true);
					}
					_select.display = [
						{value: _D3.a.value, name: _D3.a.name},
						{value: _D3.b.value, name: _D3.b.name}
					];
					break;
				case 'templates/scene/centered.html':
				case 'templates/scene/centeredPro.html':
				case 'templates/scene/centerVV.html':
				case 'templates/scene/centerVV-Mondrian.html':
					_displaySelectVisibility(false);
					break;
				case 'templates/scene/pip.html':
				case 'templates/scene/cornerH.html':
				case 'templates/scene/cornerV.html':
					_select.display = [
						{value: _D1.a.value, name: _D1.a.name},
						{value: _D1.b.value, name: _D1.b.name}
					];
					break;
				case 'templates/scene/2colL.html':
					_select.display = [
						{value: _D2.a.value, name: _D2.a.name},
						{value: _D2.b.value, name: _D2.b.name}
					];
					break;
				case 'templates/scene/2colR.html':
				case 'templates/scene/mirrored-twocol.html':
					_select.display = [
						{value: _D3.a.value, name: _D3.a.name},
						{value: _D3.b.value, name: _D3.b.name}
					];
					break;
			}
		}

		function _setSceneVideoPosition(item) {
			switch(item.templateUrl) {
				case 'templates/scene/1col.html':
				case 'templates/scene/centered.html':
				case 'templates/scene/centeredPro.html':
					_videoPositionSelectVisibility(false);
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
					break;
			}
		}

		function _setSceneItemLayout(item) {
			switch(item.templateUrl) {
				case 'templates/scene/centered.html':
				case 'templates/scene/centeredPro.html':
					break;
				case 'templates/scene/centerVV.html':
				case 'templates/scene/centerVV-Mondrian.html':
				case 'templates/scene/cornerV.html':
					if (item.layouts[0] === 'inline') {
						item.layouts[0] = 'videoLeft';
						item.layouts[1] = _D1.a.value;
					}
					item.layouts[0] = item.layouts[0];
					// item.layouts[1] = item.layouts[1] || _D1.a.value;
					break;
				case 'templates/scene/1col.html':
					item.layouts[1] = item.layouts[1] || _D3.b.value;
				// case 'templates/scene/2colL.html':
					break;
				case 'templates/scene/2colR.html':
				case 'templates/scene/2colL.html':
				case 'templates/scene/mirrored-twocol.html':
					if (item.layouts[0] === 'inline') {
						item.layouts[0] = 'videoLeft';
					}

					item.layouts[1] = item.layouts[1] || _D3.b.value;
					break;
				case 'templates/scene/pip.html':
					if (item.layouts[0] === 'inline') {
						item.layouts[0] = 'videoLeft';
					}

					item.layouts[1] = item.layouts[1] || _D1.b.value;
					break;

			}
		}

		function getSelectOpts(type) {
			return _select[type];
		}

		function getVisibility(prop) {
			return _visibility[prop];
		}

		function getTemplates(type) {
			switch (type) {
				case 'episode':
					return [
						{url: 'templates/episode/story.html', name: '(Default)'},
						{url: 'templates/episode/episode.html', name: '(Unbranded)'},
						{url: 'templates/episode/career-playbook.html', name: 'Career Playbook'},
						{url: 'templates/episode/columbia.html', name: 'Columbia University'},
						{url: 'templates/episode/columbiabusiness.html', name: 'Columbia Business School'},
						{url: 'templates/episode/eliterate.html', name: 'e-Literate TV'},
						{url: 'templates/episode/ewb.html', name: 'Engineers Without Borders'},
						{url: 'templates/episode/fieldpros.html', name: 'Field Pros'},
						{url: 'templates/episode/gw.html', name: 'George Washington'},
						{url: 'templates/episode/gwlaw.html', name: 'George Washington Law'},
						{url: 'templates/episode/gwsb.html', name: 'George Washington Fed MOOC'},
						{url: 'templates/episode/kellogg.html', name: 'Kellogg'},
						{url: 'templates/episode/narrasys-pro.html', name: 'Narrasys Professional'},
						{url: 'templates/episode/middlebury.html', name: 'Middlebury'},
						{url: 'templates/episode/purdue.html', name: 'Purdue'},
						{url: 'templates/episode/regis.html', name: 'Regis'},
						{url: 'templates/episode/schoolclimatesolutions.html', name: 'School Climate Solutions'},
						{url: 'templates/episode/usc.html', name: 'University of Southern California'},
						{url: 'templates/episode/washingtonSBCTC.html', name: 'Washington SBCTC'},
						{url: 'templates/episode/wiley1.html', name: 'Wiley'},
						{url: 'templates/episode/wiley2.html', name: 'Wiley (without endscreen text)'},
					];
				case 'scene':
					_displaySelectVisibility(false);
					_videoPositionSelectVisibility(false);
					_templateSelectVisibility(true);
					var scenes = [
						{url: _scenes.centered, name: 'Centered'},
						{url: _scenes.centeredPro, name: 'Centered Pro, Hide Transcript & Transmedia'},
						{url: _scenes['1col'], name: 'One Column'},
						{url: _scenes.cornerV, name: 'Corner Video, vertical'},
						{url: _scenes.mirroredTwoCol, name: 'Two Columns (v2 mirrored vert)'},
						{url: _scenes.cornerH, name: 'Corner video, horizontal'},
						{url: _scenes.centerVV, name: 'Vertical Pro, Hide Transcript'},
						{url: _scenes.centerVVMondrian, name: 'Vertical Pro Mondrian, Hide Transcript'},
						{url: _scenes.pip, name: 'Picture-in-picture'}
					];

					if (_userHasRole('admin')) {
						scenes.splice(
							4, 0,
							{url: _scenes['2colL'], name: 'Two Columns'},
							{url: _scenes['2colR'], name: 'Two Columns (mirrored)'}
							);
					}

					return scenes;
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
						// {url: 'templates/item/pullquote-noattrib.html', name: 'Pullquote with attribution'},
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
						linkTemplates.splice(3, 0, {
							url: 'templates/item/link-descriptionfirst.html',
							name: 'Link w/ description first'
						});
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
						{url: 'templates/item/image-fill.html', name: 'Overlay or Background fill'}
					];
					//hidden from everyone, should probably remove all together.
					// if (_userHasRole('admin')) {
					// 	imgTemplates.push(
					// 		{url: 'templates/item/image.html', name: 'Linked Image'},
					// 		{url: 'templates/item/image-inline.html', name: 'Inline Image'},
					// 		{url: 'templates/item/image-caption.html', name: 'Image with caption'}
					// 	);
					// }
					return imgTemplates;
				case 'file':
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/item/file.html', name: 'Uploaded File'},
						{url: 'templates/item/link.html', name: 'File inline'},
						{url: 'templates/item/link-descriptionfirst.html', name: 'File - description first'},
						{url: 'templates/item/link-embed.html', name: 'File embedded'},
						{url: 'templates/item/link-modal-thumb.html', name: 'File Modal'},
					];
				case 'question':
					_displaySelectVisibility(true);
					_imageFieldVisibility(true);
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						// {url: 'templates/item/question-mc.html', name: 'Default question display'},
						{url: 'templates/item/question-mc-image-right.html', name: 'Question with image right'}
						// {url: 'templates/item/question-mc-image-left.html', name: 'Question with image left'}
					];
				case 'chapter':
					//chapters have no template, but need to do side-effects
					_titleFieldVisibility(true);
					break;
			}
		}

		function onSelectChange(item, itemForm) {
			_displaySelectVisibility(false);
			switch(item.producerItemType) {
				case 'scene':
					_setSceneDisplayOpts(item);
					_setSceneVideoPosition(item);
					_setSceneItemLayout(item);
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
					_select.questionType = [
						{value: 'mc-poll', name: 'Poll'},
						{value: 'mc-formative', name: 'Formative'}
					];
					item.layouts[0] = 'windowFg';
					item.stop = true;
					break;
				case 'image':
					//will set to true in image fill
					_displaySelectVisibility(false);
					var _currentSceneName = _getSceneName(modelSvc.scene(item.scene_id));
					switch(item.templateUrl) {
						case 'templates/item/image-plain.html':
						case 'templates/item/image-inline-withtext.html':
						case 'templates/item/image-caption-sliding.html':
						case 'templates/item/image.html':
							//set back to blank when not a BG image.
							itemForm.pin = itemForm.position = '';
							item.layouts[0] = 'inline';
							break;
						case 'templates/item/image-fill.html':
							item.cosmetic = true;
							_displaySelectVisibility(true);
							_select.imagePosition = [
								{value: 'fill', name: 'Fill and stretch'},
								{value: 'contain', name: 'Contain'},
								{value: 'cover', name: 'Cover and crop'},
								{value: 'tl', name: 'Top Left'},
								{value: 'tr', name: 'Top Right'},
								{value: 'bl', name: 'Bottom Left'},
								{value: 'br', name: 'Bottom Right'},
							];
							_setAvailableImageOptsForLayout(_currentSceneName, item, itemForm);
					}
					if (item.stop === true) {
						item.layouts[0] = 'windowFg';
					}
					break;
				case 'file':
					item.showInlineDetail = false;
					switch(item.templateUrl) {
						case 'templates/item/link.html':
							item.showInlineDetail = true;
							break;
						case 'templates/item/file.html':
						case 'templates/item/link-descriptionfirst.html':
						case 'templates/item/link-modal-thumb.html':
							break;
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
							return false;
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
