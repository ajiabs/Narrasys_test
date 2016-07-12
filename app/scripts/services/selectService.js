/**
 * Created by githop on 6/7/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('selectService', selectService);

	function selectService(authSvc) {
		var _videoPositionOpts = [];
		var _userHasRole = authSvc.userHasRole;
		//use visibility map with getVisibility() and component directives
		var _visibility = {
			templateSelect: true,
			imageUpload: false,
			display: false,
			videoPosition: false,
			titleField: true,
			speakerField: true
		};

		var _imageFieldVisibility = _curryVis('imageUpload');
		var _displaySelectVisibility = _curryVis('display');
		var _videoPositionSelectVisibility = _curryVis('videoPosition');
		var _titleFieldVisibility = _curryVis('titleField');
		var _speakerFieldVisibility = _curryVis('speakerField');
		var _templateSelectVisibility = _curryVis('templateSelect');

		return {
			showTab: showTab,
			getVideoPositionOpts: getVideoPositionOpts,
			onSelectChange: onSelectChange,
			getTemplates: getTemplates,
			getVisibility: getVisibility
		};

		function _setVisibility(prop, bool) {
			_visibility[prop] = bool;
		}

		function _curryVis(prop) {
			return function (bool) {
				return _setVisibility(prop, bool);
			};
		}

		function getVisibility(prop) {
			return _visibility[prop];
		}

		function getVideoPositionOpts() {
			return _videoPositionOpts;
		}

		function getTemplates(type) {
			switch(type) {
				case 'scene':
					_displaySelectVisibility(false);
					_videoPositionSelectVisibility(false);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/scene/centered.html', name: 'Centered'},
						{url: 'templates/scene/centeredPro.html', name: 'Centered Pro' },
						{url: 'templates/scene/1col.html', name: 'One Column'},
						{url: 'templates/scene/2colL.html', name: 'Two Columns'},
						{url: 'templates/scene/2colR.html', name: 'Two Columns (mirrored)'},
						{url: 'templates/scene/cornerV.html', name: 'Vertical'},
						{url: 'templates/scene/centerVV.html', name: 'Vertical Pro'},
						{url: 'templates/scene/centerVV-Mondrian.html', name: 'Vertical Pro Mondrian'},
						{url: 'templates/scene/cornerH.html', name: 'Horizontal'},
						{url: 'templates/scene/pip.html', name: 'Picture-in-picture'}
					];
				case 'transcript':
					_speakerFieldVisibility(true);
					_templateSelectVisibility(true);
					return [
						{url: 'templates/item/transcript.html', name: 'Transcript'},
						{url: 'templates/item/transcript-withthumbnail.html', name: 'Transcript with thumbnail'}
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

		function onSelectChange(item) {
			_displaySelectVisibility(false);
			switch(item.producerItemType) {
				case 'scene':
					switch(item.templateUrl) {
						case 'templates/scene/1col.html':
							if (_userHasRole('admin')) { _displaySelectVisibility(true); }
						/* falls through */
						case 'templates/scene/centered.html':
						case 'templates/scene/centeredPro.html':
							_videoPositionSelectVisibility(false);
							_videoPositionOpts = [
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
							_videoPositionSelectVisibility(true);
							_videoPositionOpts = [
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
					_displaySelectVisibility(false);
					switch(item.templateUrl) {
						case 'templates/item/image-plain.html':
						case 'templates/item/image-inline-withtext.html':
						case 'templates/item/image-caption-sliding.html':
						case 'templates/item/image.html':
							item.layouts[0] = 'inline';
							break;
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
							return _userHasRole('admin');
						case 'Customize':
							return false;
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
