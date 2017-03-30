/**
 *
 * Created by githop on 3/23/16.
 */

/**
 * @ngdoc service
 * @name iTT.service:imageResize
 * @requires $q
 * @description
 * Resize images and convert File Objects into images. Used in practice to resize images client side prior
 * to uploading to AWS. Basic Idea is to resize images client side with HTML5 Canvas. The resized image
 * is converted back into a File object so it can be passed to the AWS service.
 * {@link https://github.com/InTheTelling/client/blob/master/app/scripts/services/imageResize.js source}
 */
imageResize.$inject = ['$q'];

export default function imageResize($q) {
  return {
    createFileFromDataURL: createFileFromDataURL,
    readFileToImg: readFileToImg,
    resizeImg: resizeImg
  };
  /**
   * @ngdoc method
   * @name #createFileFromDataURL
   * @methodOf iTT.service:imageResize
   * @description
   * Creates a File object from a data url.
   * @param {String} url base64 encoded string as url
   * @param {String} fileName name of file
   * @returns {Object} File object containing an image.
   * @example
   * <pre>
   *     var file = imageResize.createFileFromDataURL(dataUrl);
   * </pre>
   */
  function createFileFromDataURL(url, fileName) {
    var _blob = _dataURLToBlob(url);
    _blob.name = 'resized' + fileName;
    _blob.lastModifiedDate = new Date();
    return _blob;
  }

  /**
   * @ngdoc method
   * @name #readFileToImg
   * @methodOf iTT.service:imageResize
   * @description
   * Creates an Image from a File Object
   * @param {Object} file File Object
   * @returns {Object} Promise that resolves to an Image
   * @example
   * <pre>
   *     imageResize.readFileToImg(file).then(function(file) {
		 *     		//do stuff with file
		 *     }));
   * </pre>
   */
  function readFileToImg(file) {
    var _reader = new FileReader();
    var _img = new Image();
    return $q(function (resolve, reject) {
      _reader.onloadend = function () {
        console.log('onloadend fileReader!!');
        resolve(_reader.result);
      };
      _reader.onerror = function () {
        console.log('FIleReader Err', _reader.error);
        reject(_reader.error);
      };
      _reader.readAsDataURL(file);
    }).then(function (imgUrl) {
      _img.src = imgUrl;
      console.log('image preload', _img);
      return $q(function (resolve, reject) {
        _img.onload = function () {
          resolve(_img);
        };
        _img.onerror = function () {
          reject('Error Loading Image');
        };
      }).then(function (img) {
        return img;
      });
    });
  }

  /**
   * @ngdoc method
   * @name #resizeImg
   * @methodOf iTT.service:imageResize
   * @description
   * Resize image by reducing width/height by factor of 2
   * @param {Object} img Image to resize.
   * @param {Number} maxWidth target with of image resize.
   * @param {Number} maxHeight target height of image resize.
   * @param {Boolean} center Toggle image centering
   * @returns {String} Promise that resolves to a data url.
   * @example
   * <pre>
   *     imageResize.resizeImg(img, 60, 60, true)
   *     .then(function(resizedImg) {
		 *     //do stuff with resizedImg
		 *     });
   * </pre>
   */
  function resizeImg(img, maxWidth, maxHeight, center) {
    return $q(function (resolve) {
      var _canvas = document.createElement('canvas');
      var _ctx = _getContext(_canvas);
      var _dx = 0, _dy = 0;

      var _tmpCvsWidth = img.width,
        _tmpCvsHeight = img.height;

      _setCanvasWH(_canvas, _tmpCvsWidth, _tmpCvsHeight);

      _ctx.drawImage(img, 0, 0, _tmpCvsWidth, _tmpCvsHeight);

      //step down the image size by half for a smoother overall resize.
      //break here because we want our final resize out of the loop
      //to still be a down step.
      while ((_tmpCvsWidth > maxWidth || _tmpCvsHeight > maxHeight) &&
      !((_tmpCvsWidth * 0.5) < maxWidth || (_tmpCvsHeight * 0.5) < maxHeight)) {
        img.width = img.width * 0.5;
        img.height = img.height * 0.5;
        _tmpCvsWidth = img.width;
        _tmpCvsHeight = img.height;
        _canvas = _resizeImgWithCanvas(_canvas, _tmpCvsWidth, _tmpCvsHeight);
      }

      var _finalWH = _calculateNewDimensions(_canvas.width, _canvas.height, maxWidth, maxHeight);

      //handle centering of non-square resized images
      if (center) {
        //image is taller than it is wide
        //center it vertically
        if (_finalWH.height < maxHeight) {
          _dy = (maxHeight - _finalWH.height) / 2;
        }

        //image is wider than it is tall
        //center it horizontally
        if (_finalWH.width < maxWidth) {
          _dx = (maxWidth - _finalWH.width) / 2;
        }
      }

      //console.log('final draw params: ', 'cvs', _canvas, 'finalWH', _finalWH, 'dx dy', _dx, _dy);
      _canvas = _resizeImgWithCanvas(_canvas, _finalWH.width, _finalWH.height, maxWidth, maxHeight, _dx, _dy);
      resolve(_canvas.toDataURL('image/png', 1.0));
    });
  }

  /**
   * @private
   * @ngdoc
   * @methodOf iTT.service:imageResize
   * @name _setCanvasWH
   * @description
   * sets the width and height on a given canvas.
   * @param {Object} canvas HTML5 Canvas Element
   * @param {Number} width Width to set.
   * @param {Number} height Height to set.
   * @returns {Void} returns undefined.
   */
  function _setCanvasWH(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
  }

  /**
   * @private
   * @ngdoc
   * @methodOf iTT.service:imageResize
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
    //console.log('drawImage inputs: ', 'c', c, 'dx', dx, 'dy', dy, 'w', w, 'h', h);
    var _resizeCvs = document.createElement('canvas');
    var _resizeCtx = _getContext(_resizeCvs);
    _resizeCvs.width = cW !== undefined ? cW : w;
    _resizeCvs.height = cH !== undefined ? cH : h;
    _resizeCtx.drawImage(c, dx, dy, w, h);

    return _resizeCvs;
  }

  /**
   * @private
   * @ngdoc
   * @methodOf iTT.service:imageResize
   * @name _getContext
   * @description
   * Method to get the Context from an HTML5 canvas element and set anti-aliasing properties
   * @param {Object} canvas HTML5 Canvas Element
   * @returns {Object} HTML5 Canvas Context object.
   */
  function _getContext(canvas) {
    var context = canvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    context.oImageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    return context;
  }

  /**
   * @private
   * @ngdoc
   * @methodOf iTT.service:imageResize
   * @name _dataURLToBlob
   * @description
   * Converts data url to Blob object which can be used as data for a File object
   * Taken from https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
   * @param {String} dataURL base64 encoded string containing image
   * @returns {Object} Blob Object
   */
  function _dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {  //jshint ignore:line
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);

      return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER); //jshint ignore:line
    var contentType = parts[0].split(':')[1]; //jshint ignore:line
    var raw = window.atob(parts[1]); //jshint ignore:line
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
  }

  /**
   * @private
   * @ngdoc method
   * @methodOf iTT.service:imageResize
   * @name _calculateNewDimensions
   * @description
   * Calculates the dimensions of a rectangle (for an image) while maintaining the original aspect ratio.
   * @param {Number} srcWidth Input width of rectangle.
   * @param {Number} srcHeight Input height of rectangle.
   * @param {Number} maxWidth Target width of rectangle.
   * @param {Number} maxHeight Target height of rectangle.
   * @returns {Object} Object with width and height properties as integers.
   */
  function _calculateNewDimensions(srcWidth, srcHeight, maxWidth, maxHeight) {
    var _ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return {width: Math.floor(srcWidth * _ratio), height: Math.floor(srcHeight * _ratio)};
  }
}

