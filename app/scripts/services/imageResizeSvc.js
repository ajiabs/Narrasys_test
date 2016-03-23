/**
 *
 * Created by githop on 3/23/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('imageResize', imageResize);

	function imageResize($q) {
		var _fileName;

		return {
			createFileFromDataURL: createFileFromDataURL,
			readFileToImg: readFileToImg,
			autoResizeAvatar: autoResizeAvatar
		};

		function createFileFromDataURL(url) {
			var _blob = _dataURLToBlob(url);
			_fileName = 'resized ' + _fileName;
			return $q(function(resolve) {
				resolve(new File([_blob], _fileName, {type: 'image/jpeg'})); //jshint ignore:line
			});
		}

		function readFileToImg(f) {
			var _reader = new FileReader();
			var _img = new Image();
			return $q(function(resolve) {
				_reader.onload = function() {
					resolve(_reader.result);
				};
				_reader.readAsDataURL(f);
			}).then(function(imgUrl) {
				_img.src = imgUrl;
				return _img;
			});
		}

		function autoResizeAvatar(img, maxWidth, maxHeight) {
			return $q(function(resolve) {
				var _vertAlign;
				var _finalWH;
				var _canvas = document.createElement('canvas');
				var _ctx = _getContext(_canvas);

				_setCanvasWH(_canvas, img.width, img.height);

				var _tmpCvsWidth  = img.width,
					_tmpCvsHeight = img.height;

				_ctx.drawImage(img, 0, 0, _tmpCvsWidth, _tmpCvsHeight);

				while (_tmpCvsWidth > maxWidth) {
					//break here because we want our final resize out of the loop
					//to still be a down step.
					if ((_tmpCvsWidth * 0.5) / 2 < maxWidth) {
						break;
					}

					//bitwise OR will floor num ;)
					img.width  = (img.width  * 0.5) | 0; //jshint ignore:line
					img.height = (img.height * 0.5) | 0; //jshint ignore:line
					_tmpCvsWidth  = img.width;
					_tmpCvsHeight = img.height;
					_canvas = _resizeImgWithCanvas(_canvas, _tmpCvsWidth, _tmpCvsHeight);
				}

				_finalWH = _calculateAspectRatio(_tmpCvsWidth, _tmpCvsHeight, maxWidth, maxHeight);

				if (_finalWH.height < _finalWH.width) {
					_vertAlign = (_finalWH.width - _finalWH.height) / 2;
				}

				_canvas = _resizeImgWithCanvas(_canvas, _finalWH.width, _finalWH.height, maxWidth, maxHeight, _vertAlign);
				resolve(_canvas.toDataURL('image/jpeg', 1.0));
			});
		}

		//private helpers
		function _setCanvasWH(c, w, h) {
			c.width = w;
			c.height = h;
		}

		function _resizeImgWithCanvas(c, w, h, cW, cH, dy) {
			var _resizeCvs = document.createElement('canvas');
			var _resizeCtx = _getContext(_resizeCvs);
			_resizeCvs.width = cW || w;
			_resizeCvs.height = cH || h;
			_resizeCtx.drawImage(c, 0, dy || 0, w, h);
			console.log('resizing img: ', w, 'x', h);
			return _resizeCvs;
		}

		function _getContext (canvas) {
			var context = canvas.getContext('2d');
			context.imageSmoothingEnabled       = true;
			context.mozImageSmoothingEnabled    = true;
			context.oImageSmoothingEnabled      = true;
			context.webkitImageSmoothingEnabled = true;
			return context;
		}

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

		function _calculateAspectRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
			var _ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

			return { width: Math.floor(srcWidth * _ratio), height: Math.floor(srcHeight * _ratio) };
		}
	}


})();
