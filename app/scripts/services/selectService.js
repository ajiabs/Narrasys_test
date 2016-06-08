/**
 * Created by githop on 6/7/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('selectService', selectService);

	function selectService(authSvc) {
		var _videoPositionOpts = [];
		var _layoutDropdownVisible = false;
		var _admin = authSvc.userHasRole('admin');
		var _custAdmin = authSvc.userHasRole('customer admin');
		return {
			showTab: showTab,
			getVideoPositionOpts: getVideoPositionOpts,
			onSelectChange: onSelectChange,
			getTemplates: getTemplates,
			showLayoutDropdown: showLayoutDropdown
		};

		function getTemplates(type) {
			switch(type) {
				case 'scene':
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
					return [
						{url: 'templates/item/transcript.html', name: 'Transcript'},
						{url: 'templates/item/transcript-withthumbnail.html', name: 'Transcript with thumbnail'},
						{url: 'templates/item/transcript-withthumbnail-alt.html', name: 'Transcript with thumbnail B'}
					];
				case 'annotation':
					return [
						{url: 'templates/item/pullquote.html', name: 'Pullquote with attribution'},
						{url: 'templates/item/pullquote-noattrib.html', name: 'Pullquote with attribution'},
						{url: 'templates/item/text-h1.html', name: 'Header 1'},
						{url: 'templates/item/text-h2.html', name: 'Header 2'},
						{url: 'templates/item/text-transmedia.html', name: 'Long text (as transmedia)'},
						{url: 'templates/item/text-definition.html', name: 'Definition (as transmedia)'}
					];
				case 'link':
					return [
						{url: 'templates/item/link.html', name: 'Link'},
						{url: 'templates/item/link-withimage.html', name: 'Link with image'},
						{url: 'templates/item/link-withimage-notitle.html', name: 'Link with image - no title'},
						{url: 'templates/item/link-descriptionfirst.html', name: 'Link: description first'},
						{url: 'templates/item/link-embed.html', name: 'Embedded Link'},
						{url: 'templates/item/link-modal-thumb.html', name: 'Link Modal'}
					];
				case 'image':
					return [
						{url: 'templates/item/image-fill.html', name: 'Overlay or background fill'},
						{url: 'templates/item/image.html', name: 'Linked Image'},
						{url: 'templates/item/image-inline.html', name: 'Inline Image'},
						{url: 'templates/item/image-inline-withtext.html', name: 'Inline Image with text'},
						{url: 'templates/item/image-caption.html', name: 'Image with caption'},
						{url: 'templates/item/image-caption-sliding.html', name: 'Image with sliding caption'},
						{url: 'templates/item/image-thumbnail.html', name: 'Image thumbnail'},
						{url: 'templates/item/image-plain.html', name: 'Plain image'}
					];
				case 'file':
					return [
						{url: 'templates/item/file.html', name: 'Uploaded File'}
					];
				case 'question':
					return [
						{url: 'templates/item/question-mc.html', name: 'Default question display'},
						{url: 'templates/item/question-mc-image-right.html', name: 'Question with image right'},
						{url: 'templates/item/question-mc-image-left.html', name: 'Question with image left'}
					];
			}
		}


		function onSelectChange(item) {
			_layoutDropdownVisible = false;
			switch(item._type) {
				case 'Scene':
					switch(item.templateUrl) {
						case 'templates/scene/1col.html':
							if (_admin) { _layoutDropdownVisible = true; }
						case 'templates/scene/centered.html':
						case 'templates/scene/centeredPro.html':
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
								_layoutDropdownVisible = true;
							}

							break;
					}
					break;
				case 'Image':
					break;
			}
		}

		function getVideoPositionOpts() {
			return _videoPositionOpts;
		}

		function showLayoutDropdown() {
			return _layoutDropdownVisible;
		}

		function showTab(itemType, tabTitle) {
			switch (itemType) {
				case 'scene':
					switch(tabTitle) {
						case 'Item':
							return _admin;
						case 'Style':
							return true;
						case 'Customize':
							return _admin;
					}
					break;
				case 'transcript':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return (_admin || _custAdmin);
						case 'Customize':
							return _admin;
					}
					break;
				case 'annotation':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return (_admin || _custAdmin);
						case 'Customize':
							return _admin;
					}
					break;
				case 'link':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return (_admin || _custAdmin);
						case 'Customize':
							return _admin;
					}
					break;
				case 'image':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return (_admin || _custAdmin);
						case 'Customize':
							return _admin;
					}
					break;
				case 'file':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return (_admin || _custAdmin);
						case 'Customize':
							return _admin;
					}
					break;
				case 'question':
					switch(tabTitle) {
						case 'Item':
							return true;
						case 'Style':
							return _admin;
						case 'Customize':
							return _admin;
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
