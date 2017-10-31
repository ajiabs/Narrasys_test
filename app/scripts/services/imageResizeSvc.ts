/**
 *
 * Created by githop on 3/23/16.
 */
import { SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE, TSocialTagTypes } from '../constants';

export interface IImageResize {
  createFileFromDataURL(url: string, fileName: string): FileBlob;
  readFileToDataURI(file: File): ng.IPromise<string>;
  readFileToImg(file: File): ng.IPromise<HTMLImageElement>;
  resizeImg(img: HTMLImageElement, maxWidth: number, maxHeight: number, center: boolean): ng.IPromise<string>;
  getImageTagType(w: number, h: number): TSocialTagTypes;
}

//When this module was authored, Safari did not support the use of File Objects. A workaround
//is to coerce a Blob into a File by adding the missing properties
interface FileBlob extends Blob {
  name?: string;
  lastModifiedDate?: Date;
}

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

export class ImageResize implements IImageResize {
  static Name = 'imageResize'; // tslint:disable-line
  static $inject = ['$q'];

  constructor(private $q: ng.IQService) {
    //
  }

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
  createFileFromDataURL(url: string, fileName: string): FileBlob {
    const _blob = ImageResize._dataURLToBlob(url);
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
  readFileToImg(file: File): ng.IPromise<HTMLImageElement> {
    const _img = new Image();
    return this.readFileToDataURI(file).then((imgUrl) => {
      _img.src = imgUrl;
      return this.$q((resolve, reject) => {
        _img.onload = function () {
          resolve(_img);
        };
        _img.onerror = function () {
          reject('Error Loading Image');
        };
      }).then((img: HTMLImageElement) => img);
    });
  }

  readFileToDataURI(file: File): ng.IPromise<string> {
    const _reader = new FileReader();
    return this.$q((resolve, reject) => {
      _reader.onloadend = () => {
        resolve(_reader.result);
      };
      _reader.onerror = () => {
        reject(_reader.error);
      };
      _reader.readAsDataURL(file);
    }).then((imgUrl: string) => imgUrl);
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
  resizeImg(img: HTMLImageElement, maxWidth: number, maxHeight: number, center: boolean): ng.IPromise<string> {
    return this.$q((resolve) => {
      let _canvas: HTMLCanvasElement = document.createElement('canvas');
      const _ctx = ImageResize._getContext(_canvas);
      let _dx = 0, _dy = 0;

      let _tmpCvsWidth = img.width,
        _tmpCvsHeight = img.height;

      ImageResize._setCanvasWH(_canvas, _tmpCvsWidth, _tmpCvsHeight);

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
        _canvas = ImageResize._resizeImgWithCanvas(_canvas, _tmpCvsWidth, _tmpCvsHeight);
      }

      const _finalWH = ImageResize._calculateNewDimensions(_canvas.width, _canvas.height, maxWidth, maxHeight);

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
      _canvas = ImageResize._resizeImgWithCanvas(
        _canvas, _finalWH.width, _finalWH.height, maxWidth, maxHeight, _dx, _dy
      );
      resolve(_canvas.toDataURL('image/png', 1.0));
    });
  }

  getImageTagType(w: number, h: number): TSocialTagTypes {
    const aspectRatio = ImageResize.calcAspectRatio(w, h);
    if (aspectRatio > 1.25) {
      return SOCIAL_IMAGE_WIDE;
    } else {
      return SOCIAL_IMAGE_SQUARE;
    }
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
  private static _dataURLToBlob(dataURL: string): FileBlob {
    const BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {  // tslint:disable-line
      const parts = dataURL.split(',');
      const contentType = parts[0].split(':')[1];
      const raw = decodeURIComponent(parts[1]);

      return new Blob([raw], { type: contentType });
    }

    const parts = dataURL.split(BASE64_MARKER); //jshint ignore:line
    const contentType = parts[0].split(':')[1]; //jshint ignore:line
    const raw = window.atob(parts[1]); //jshint ignore:line
    const rawLength = raw.length;

    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; i += 1) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
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
  private static _setCanvasWH(canvas: HTMLCanvasElement, width: number, height: number): void {
    canvas.width = width;
    canvas.height = height;
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
  private static _getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const context = canvas.getContext('2d');
    (context as any).imageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    context.oImageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    return context;
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
   * @param {Number} [dx=0] Optional param,
   *  Amount to horizontally offset the image inside the canvas element, defaults to 0.
   * @param {Number} [dy=0] Optional param,
   *  Amount to vertically offset the image inside the canvas element, defaults to 0.
   * @returns {Object} HTML5 canvas element.
   */
  private static _resizeImgWithCanvas(c, w, h, cW = w, cH = h, dx = 0, dy = 0) {
    const _resizeCvs: HTMLCanvasElement = document.createElement('canvas');
    const _resizeCtx = ImageResize._getContext(_resizeCvs);
    _resizeCvs.width = cW;
    _resizeCvs.height = cH;
    _resizeCtx.drawImage(c, dx, dy, w, h);
    return _resizeCvs;
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
  private static _calculateNewDimensions(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
    const _ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: Math.floor(srcWidth * _ratio), height: Math.floor(srcHeight * _ratio) };
  }

  private static calcAspectRatio(w: number, h: number): number {
    return w / h;
  }
}
