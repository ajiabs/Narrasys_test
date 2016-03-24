/**
 *
 * Created by githop on 3/23/16.
 */

(function() {
	'use strict';

	/**
	 * @ngDoc overview
	 * @name com.inthetelling.story
	 **/
	angular.module('com.inthetelling.story')
		/**
		 * @ngDoc service
		 * @name com.inthetelling.story.imageResize
		 * @description
		 * Resize images and convert File Objects into images.
		 */
		.factory('imageResize', imageResize);

	function imageResize($q) {
		return {
			createFileFromDataURL: createFileFromDataURL,
			readFileToImg: readFileToImg,
			autoResizeAvatar: autoResizeAvatar
		};
		/**
		 * @ngDoc method
		 * @name #createFileFromDataURL
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @description
		 * Creates a File object from a data url.
		 * @param {string} url base64 encoded string as url
		 * @param {string} fileName name of file
		 * @returns {Object} File object containing an image.
		 */
		function createFileFromDataURL(url, fileName) {
			var _blob = _dataURLToBlob(url);
			_blob.name = 'resized' + fileName;
			_blob.lastModifiedDate = new Date();
			return _blob;
		}
		/**
		 * @ngDoc method
		 * @name #readFileToImg
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @description
		 * Creates an Image from a File Object
		 * @param {Object} file File Object
		 * @returns {Object} Promise that resolves to an Image
		 */
		function readFileToImg(file) {
			var _reader = new FileReader();
			var _img = new Image();
			return $q(function(resolve) {
				_reader.onload = function() {
					resolve(_reader.result);
				};
				_reader.readAsDataURL(file);
			}).then(function(imgUrl) {
				_img.src = imgUrl;
				return _img;
			});
		}
		/**
		 * @ngDoc method
		 * @name #autoResizeAvatar
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @description
		 * Resize image by reducing width/height by half until target dimensions are met.
		 * If the max dimensions square, e.g. 60x60, and the input image is not, the resulting
		 * image is resized to the max width / height and vertically / horizontally centered inside a 60x60 canvas,
		 * resulting in a letter-box effect.
		 * @param {Object} img Image to resize.
		 * @param {String} mimeType type of image file
		 * @param {Number} maxWidth target with of image resize.
		 * @param {Number} maxHeight target height of image resize.
		 * @returns {String} Promise that resolves to a data url.
		 */
		function autoResizeAvatar(img, mimeType, maxWidth, maxHeight) {
			return $q(function(resolve) {
				var _dy;
				var _dx;
				var _finalWH;
				var _canvas = document.createElement('canvas');
				var _ctx = _getContext(_canvas);

				_setCanvasWH(_canvas, img.width, img.height);

				var _tmpCvsWidth  = img.width,
					_tmpCvsHeight = img.height;

				_ctx.drawImage(img, 0, 0, _tmpCvsWidth, _tmpCvsHeight);

				//step down the image size by half for a smoother overall resize.
				while (_tmpCvsWidth > maxWidth) {
					//break here because we want our final resize out of the loop
					//to still be a down step.
					if ((_tmpCvsWidth * 0.5) / 2 < maxWidth) {
						break;
					}

					img.width  = Math.floor(img.width  * 0.5);
					img.height = Math.floor(img.height * 0.5);
					_tmpCvsWidth  = img.width;
					_tmpCvsHeight = img.height;
					_canvas = _resizeImgWithCanvas(_canvas, _tmpCvsWidth, _tmpCvsHeight);
				}

				_finalWH = _calculateNewDimensions(_tmpCvsWidth, _tmpCvsHeight, maxWidth, maxHeight);

				//image is taller than it is wide
				//center it vertically
				if (_finalWH.height < _finalWH.width) {
					_dy = (_finalWH.width - _finalWH.height) / 2;
				}

				//image is wider than it is tall
				//center it horizontally
				if(_finalWH.height > _finalWH.width) {
					_dx = (_finalWH.height - _finalWH.width) / 2;
				}

				_canvas = _resizeImgWithCanvas(_canvas, _finalWH.width, _finalWH.height, maxWidth, maxHeight, _dx, _dy);
				resolve(_canvas.toDataURL(mimeType || 'image/jpeg', 1.0));
			});
		}
		/**
		 * @ngDoc function
		 * @private
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @name _setCanvasWH
		 * @description
		 * sets the width and height on a given canvas.
		 * @param {Object} canvas HTML5 Canvas Element
		 * @param {Number} width Width to set.
		 * @param {Number} height Height to set.
		 * @returns
		 */
		function _setCanvasWH(canvas, width, height) {
			canvas.width = width;
			canvas.height = height;
		}
		/**
		 * @ngDoc function
		 * @private
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @name _resizeImgWithCanvas
		 * @description
		 * Resize an image rendered in an HTML5 canvas element to given dimensions
		 * @param {Object} c HTML5 Canvas Element
		 * @param {Number} w Target width to resize image to.
		 * @param {Number} h Target height to resize image to.
		 * @param {Number} [cW=w] Optional param, Target width of canvas, defaults to image width.
		 * @param {Number} [cH=h] Optional param, Target height of canvas, defaults to image height.
		 * @param {Number} [dx=0] Optional param, Amount to horizontally offset the image inside the canvas element, defaults to 0.
		 * @param {Number} [dy=0] Optional param, Amount to vertically offset the image inside the canvas element, defaults to 0.
		 * @returns {Object} HTML5 canvas element.
		 */
		function _resizeImgWithCanvas(c, w, h, cW, cH, dx, dy) {
			if (dy === undefined) {
				dy = 0;
			}
			if (dx === undefined) {
				dx = 0;
			}
			var _resizeCvs = document.createElement('canvas');
			var _resizeCtx = _getContext(_resizeCvs);
			_resizeCvs.width = cW !== undefined ? cW : w;
			_resizeCvs.height = cH !== undefined ? cH : h;
			_resizeCtx.drawImage(c, dx, dy, w, h);
			console.log('resizing img: ', w, 'x', h);
			return _resizeCvs;
		}
		/**
		 * @ngDoc function
		 * @private
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @name _getContext
		 * @description
		 * Method to get the Context from an HTML5 canvas element and set anti-aliasing properties
		 * @param {Object} canvas HTML5 Canvas Element
		 * @returns {Object} HTML5 Canvas Context object.
		 */
		function _getContext (canvas) {
			var context = canvas.getContext('2d');
			context.imageSmoothingEnabled       = true;
			context.mozImageSmoothingEnabled    = true;
			context.oImageSmoothingEnabled      = true;
			context.webkitImageSmoothingEnabled = true;
			return context;
		}
		/**
		 * @ngDoc function
		 * @private
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @name _dataURLToBlob
		 * @description
		 * Converts data url to Blob object which can be used as data for a File object
		 * Taken from https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
		 * @param {String} dataURL base64 encoded string containing image
		 * @returns {Object} Blob Object
		 */
		function _dataURLToBlob(dataURL) {
			var BASE64_MARKER = ';base64,';
			if (dataURL.indexOf(BASE64_MARKER) == -1) {
				var parts = dataURL.split(',');
				var contentType = parts[0].split(':')[1];
				var raw = decodeURIComponent(parts[1]);

				return new Blob([raw], {type: contentType});
			}

			var parts = dataURL.split(BASE64_MARKER);
			var contentType = parts[0].split(':')[1];
			var raw = window.atob(parts[1]);
			var rawLength = raw.length;

			var uInt8Array = new Uint8Array(rawLength);

			for (var i = 0; i < rawLength; ++i) {
				uInt8Array[i] = raw.charCodeAt(i);
			}

			return new Blob([uInt8Array], {type: contentType});
		}
		/**
		 * @ngDoc function
		 * @private
		 * @methodOf com.inthetelling.story.imageResize:imageResize
		 * @name _calculateNewDimensions
		 * @description
		 * Calculates the dimensions of a rectangle (for an image while maintaining the original aspect ratio.
		 * @param {Number} srcWidth Input width of rectangle.
		 * @param {Number} srcHeight Input height of rectangle.
		 * @param {Number} maxWidth Target width of rectangle.
		 * @param {Number} maxHeight Target height of rectangle.
		 * @returns {Object} Object with width and height properties as integers.
		 */
		function _calculateNewDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
			var _ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

			return { width: Math.floor(srcWidth * _ratio), height: Math.floor(srcHeight * _ratio) };
		}
	}


})();
