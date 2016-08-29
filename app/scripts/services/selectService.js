/**
 * Created by githop on 6/7/16.
 */
(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('selectService', selectService);

	function selectService(authSvc, modelSvc, dataSvc, ittUtils) {
		var _userHasRole = authSvc.userHasRole;
		var _existy = ittUtils.existy;

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
						{value: 'altBg', name: 'Transmedia pane (alt) background', isDisabled: true},
						{value: 'altFg', name: 'Transmedia pane foreground', isDisabled: true},
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
				case 'cornerH':
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
						item.layouts = ['altBg'];
					}

					itemForm.position = itemForm.position || 'fill'; //P1-A
					item.layouts = item.layouts || ['altBg'];
					break;
				case 'pip':
					_displaySelectVisibility(false);
					itemForm.position = itemForm.position || 'fill';
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

		function getSelectOpts(type) {
			return _select[type];
		}

		function getVisibility(prop) {
			return _visibility[prop];
		}

		function getTemplates(type) {
			switch (type) {
				case 'episode':
					var custIds = authSvc.getCustomerIdsFromRoles();
					var _reduceTemplates = function(accm, curr) {
						//admins get all templates
						if (_userHasRole('admin')) {
							if (curr.type === 'Episode') {
								accm.push({url: curr.url, name: curr.displayName});
							}
							return accm;
						} else {
							//return templates with assoc to customer
							if (curr.type === 'Episode' && _existy(curr.customerIds)) {
								var hasCustomer = ittUtils.intersection(custIds, curr.customerIds);
								if (hasCustomer.length > 0){
									accm.push({url: curr.url, name: curr.displayName});
								}
								//add default templates
								if (curr.customerIds.length === 0) {
									accm.push({url: curr.url, name: curr.displayName});
								}
							}
							return accm;
						}
					};

					var _sortAlpha = function(a, b) {
						if (a.name < b.name) {
							return -1;
						} else if (a.name > b.name) {
							return 1;
						} else {
							return 0;
						}
					};

					return dataSvc.getTemplates().reduce(_reduceTemplates, []).sort(_sortAlpha);
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
						{url: 'templates/item/image-inline.html', name: 'Inline Image'},
						{url: 'templates/item/image-inline-withtext.html', name: 'Inline Image with text'},
						{url: 'templates/item/image-caption-sliding.html', name: 'Image with sliding caption'},
						{url: 'templates/item/image-thumbnail.html', name: 'Image thumbnail'},
						{url: 'templates/item/image-fill.html', name: 'Overlay or Background fill'}
					];
					return imgTemplates;
				case 'file':
					_titleFieldVisibility(true);
					_templateSelectVisibility(false);
					return [
						{url: 'templates/item/file.html', name: 'Uploaded File'},
					];
				case 'question':
					_displaySelectVisibility(true);
					_imageFieldVisibility(true);
					_titleFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/item/question-mc-image-right.html', name: 'Question with image right'}
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
					var isInline = item.layouts[0] === 'inline';
					switch(item.templateUrl) {
						case 'templates/scene/centered.html': //centered
						case 'templates/scene/centeredPro.html': //Centered Pro, Hide Transcript & Transmedia
							_videoPositionSelectVisibility(false);
							_displaySelectVisibility(false);
							item.layouts[0] = ''; //P1 Video Centered
							item.layouts[1] = _D1.a.value;
							break;
						case 'templates/scene/centerVV.html': //Vertical Pro, Hide Transcript
						case 'templates/scene/centerVV-Mondrian.html': //Vertical Pro Mondrian, Hide Transcript
							_displaySelectVisibility(false);
							_videoPositionSelectVisibility(true);
							_select.video = [
								{value: 'videoLeft', name: 'Video on Left'},
								{value: 'videoRight', name: 'Video on Right'}
							];
							item.layouts[1] = _D1.a.value;
							if (isInline) {
								item.layouts[0] = 'videoLeft'; //P2 video left
							}
							item.layouts[0] = item.layouts[0];
							break;
						case 'templates/scene/cornerV.html': //Corner video, vertical
						case 'templates/scene/cornerH.html': //Corner video, horizontal
						case 'templates/scene/pip.html': //picture in picture
							_displaySelectVisibility(true);
							_videoPositionSelectVisibility(true);
							_select.video = [
								{value: 'videoLeft', name: 'Video on Left'},
								{value: 'videoRight', name: 'Video on Right'}
							];
							_select.display = [
								{value: _D1.a.value, name: _D1.a.name},
								{value: _D1.b.value, name: _D1.b.name}
							];

							if (isInline || item.layouts[0] === '') {
								item.layouts[0] = 'videoLeft'; //P2 video left
								item.layouts[1] = _D1.a.value;
							}
							item.layouts[0] = item.layouts[0];
							item.layouts[1] = item.layouts[1];
							break;
						case 'templates/scene/mirrored-twocol.html': // Two Columns (v2 mirrored vert)
							_displaySelectVisibility(true);
							_videoPositionSelectVisibility(true);
							_select.video = [
								{value: 'videoLeft', name: 'Video on Left'},
								{value: 'videoRight', name: 'Video on Right'}
							];
							_select.display = [
								{value: _D2.a.value, name: _D2.a.name},
								{value: _D2.b.value, name: _D2.b.name}
							];
							item.layouts[1] = _D2.b.value;
							if (isInline) {
								item.layouts[0] = 'videoLeft'; //P2 video left
							}
							item.layouts[0] = item.layouts[0];
							break;
						case 'templates/scene/1col.html': //One Column
							_displaySelectVisibility(true);
							_videoPositionSelectVisibility(false);
							_select.display = [
								{value: _D3.a.value, name: _D3.a.name},
								{value: _D3.b.value, name: _D3.b.name}
							];
							item.layouts[0] = ''; //P1 Video Centered
							if (isInline) {
								item.layouts[1] = _D3.b.value;
							}
							item.layouts[1] = item.layouts[1];
							break;
						case 'templates/scene/2colL.html': // Two Columns
						case 'templates/scene/2colR.html': //Two Columns mirrored
							_displaySelectVisibility(true);
							_videoPositionSelectVisibility(true);
							_select.video = [
								{value: '', name: 'Video Centered'},
								{value: 'videoLeft', name: 'Video on Left'},
								{value: 'videoRight', name: 'Video on Right'}
							];
							_select.display = [
								{value: _D3.a.value, name: _D3.a.name},
								{value: _D3.b.value, name: _D3.b.name}
							];
							if (isInline) {
								item.layouts[0] = ''; //P3
								item.layouts[1] = _D3.b.value;
							}
							item.layouts[0] = item.layouts[0];
							item.layouts[1] = item.layouts[1];
							break;
					}
					break;
				case 'link':
					_displaySelectVisibility(true);
					_imageFieldVisibility(true);
					_templateSelectVisibility(true);
					if (item.stop === true) {
						item.layouts[0] = 'windowFg';
						//prevent link-modal template from opening on top of stop-item modal
						if (item.templateUrl === 'templates/item/link-modal-thumb.html') {
							item.templateUrl = 'templates/item/link-embed.html';
							// angular.forEach(item.templateOpts, function(opt) {
							// 	console.log('opt!!', opt);
							// });
						}
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

							console.log('itemForm', itemForm);
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
