/**
 * Created by githop on 6/7/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.service('selectService', selectService);

	function selectService() {

		return {
			getTemplates: getTemplates,
			sceneTemplates: sceneTemplates,
			getLayouts: getLayouts
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
						{url: 'templates/scene/cornerH.html', name: 'Horizontal'},
						{url: 'templates/scene/cornerV.html', name: 'Vertical'},
						{url: 'templates/scene/centerVV.html', name: 'Vertical Pro'},
						{url: 'templates/scene/centerVV-Mondrian.html', name: 'Vertical Pro Mondrian'}
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

		function sceneTemplates() {

		}

		function getLayouts(arg) {
			return [
				{value: 'inline', name: 'inline'},
				{value: '', name: 'Centered'}
			];
		}
	}



})();
