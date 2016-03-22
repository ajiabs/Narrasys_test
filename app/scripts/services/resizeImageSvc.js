/**
 * Created by githop on 3/21/16.
 */

(function() {
	'use strict';
	angular.module('com.inthetelling.story')
		.service('resizeImage', ResizeImage);

	//Service
	function ResizeImage($q) {
		this._canvas = document.createElement('canvas');
		this._ctx = _getContext(this._canvas);
		this._tmpImg = new Image();
		this.$q = $q;
		this.fileName = '';
	}

	ResizeImage.prototype.createFileFromDataURL = function(url) {
		var self = this;
		var _blob = _dataURLToBlob(url);
		self.fileName = 'resized ' + this.fileName;
		return self.$q(function(resolve) {
			resolve(new File([_blob], self.fileName, {type: 'image/jpeg'})); //jshint ignore:line
		});
	};

	ResizeImage.prototype.twoStepResize = function(file, MAX_WIDTH, MAX_HEIGHT) {
		var self = this;
		self._tmpImg.src = URL.createObjectURL(file);
		self.fileName = file.name;
		var _canvasTmp = document.createElement('canvas');
		var _ctxTmp = _getContext(_canvasTmp);
		var _centerImg = 0;
		//set default target size to 120x120px
		MAX_WIDTH = MAX_WIDTH || 120;
		MAX_HEIGHT = MAX_HEIGHT || 120;

		return self.$q(function(resolve) {
			//we have to load the image to get a handle on its properties
			self._tmpImg.onload = function() {
				//release object URL created above
				//utimately we're going to use a src from AWS so we can let this one go.
				URL.revokeObjectURL(this.src);
				resolve(this);
			};
		}).then(function(img) {
			//reduce by half for first step
			//use temp canvas for reduction
			_canvasTmp.width = img.width * 0.5;
			_canvasTmp.height = img.height * 0.5;
			_ctxTmp.drawImage(img, 0, 0, _canvasTmp.width, _canvasTmp.height);

			//reduce half image the rest of the way
			//determine final image dimesions
			var calcWH = _calculateAspectRatio(_canvasTmp.width, _canvasTmp.height, MAX_WIDTH, MAX_HEIGHT);
			//set final canvas dimensions from final image size
			self._canvas.width = calcWH.width;
			self._canvas.height = calcWH.height;

			//center non-square image in middle of canvas
			if (calcWH.height < calcWH.width) {
				self._canvas.height = calcWH.width;
				_centerImg = (calcWH.width - calcWH.height) / 2;
			}

			//draw final image from temp canvas to final canvas
			self._ctx.drawImage(_canvasTmp, 0, _centerImg, calcWH.width, calcWH.height);

			//export dataURL
			return self._canvas.toDataURL('image/jpeg');
		});
	};

	ResizeImage.prototype.getResizedFile = function(file) {
		var self = this;
		var _MAX_HEIGHT = 60, _MAX_WIDTH = 60;

		self._tmpImg.src = URL.createObjectURL(file);
		return self.$q(function(resolve) {
			self._tmpImg.onload = function() {
				//calculate new image size
				var calcXY = _calculateAspectRatio(this.width, this.height, _MAX_WIDTH, _MAX_HEIGHT);
				//set canvas dimensions based upon calculated image size
				self._canvas.width = calcXY.width;
				self._canvas.height = calcXY.height;

				//rezise image by drawing it to a canvas with new dimensions
				self._ctx.drawImage(self._tmpImg, 0, 0, calcXY.width, calcXY.height);

				//turn canvas back into base64 encoded str for image source
				var _resizedSrc = self._canvas.toDataURL('image/jpeg');
				//create Blob from dataURL
				var _resizedBlob = _dataURLToBlob(_resizedSrc);
				////create File from Blob
				var _newFilename = 'resized ' + file.name;
				var resizedFileFromBlob = new File([_resizedBlob], _newFilename, {type:'image/jpeg'}); //jshint ignore:line
				//return File Object to be handled by awsSvc
				resolve(resizedFileFromBlob);
			};
		});
	};



	ResizeImage.prototype.stepResize = function(file) {
		var self = this;
		self.fileName = file.name;

		return self.$q(function(resolve) {
			self._tmpImg.src = URL.createObjectURL(file);

			self._tmpImg.onload = function() {
				var _finalImg = new Image();
				var _stepImg = null;
				var _img = this;
				var maxW = 60;
				var maxH = 60;

				var cW = this.width;
				var cH = this.height;

				function downStep() {
					console.count('downstepped!'); //gets called 4k times, not a good solution
					cW = Math.max(cW / 2, maxW);
					cH = Math.max(cH / 2, maxH);

					self._canvas.width = cW;
					self._canvas.height = cH;
					self._ctx.drawImage(_stepImg || _img, 0, 0, cW, cH);

					_finalImg.src = self._canvas.toDataURL('image/jpeg');

					if (cW <= maxW || cH <= maxH) {
						resolve(_finalImg);
					}

					if (!_stepImg) {
						_stepImg = new Image();
						_stepImg.onload = downStep;
					}

					_stepImg.src = _finalImg.src;
				}

				if (cW <= maxW || cH <= maxH || cW / 2 < maxW || cH / 2 < maxH) {
					self._canvas.width = maxW;
					self._canvas.height = maxH;
					self._ctx.drawImage(_img, 0, 0, maxW, maxH);
					_finalImg.src = self._canvas.toDataURL('image/jpeg');
					resolve(_finalImg);
				} else {
					downStep();
				}
			};
		});
	};

	//private helpers
	function _getContext (canvas) {
		var context = canvas.getContext('2d');
		context.imageSmoothingEnabled       = true;
		context.mozImageSmoothingEnabled    = true;
		context.oImageSmoothingEnabled      = true;
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

})();
