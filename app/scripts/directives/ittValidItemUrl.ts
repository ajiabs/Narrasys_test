/**
 *
 * Created by githop on 4/21/16.
 */


/**
 * @ngdoc directive
 * @name iTT.directive:ittValidateUrl
 * @restrict 'EA'
 * @scope
 * @description
 * Directive used on url inputs to allow custom validation
 * @requires $q
 * @requires ngModel
 * @requires errorSvc
 * @requires urlService
 * @requires ittUtils
 * @requires dataSvc
 * @param {Object} item The item that the url we are validating belongs to
 * @example
 * <pre>
 *     <input type="url" itt-validate-url item="item"/>
 * </pre>
 */

import {ILinkValidationMessage, ILinkValidFields} from '../interfaces';

ittValidItemUrl.$inject = ['$q', 'ittUtils', 'dataSvc', 'urlService'];

export default function ittValidItemUrl($q, ittUtils, dataSvc, urlService) {
  return {
    require: '?ngModel',
    scope: {
      onValidationNotice: '&'
    },
    link: function link(scope, elm, attrs, ngModel) {
      let message: ILinkValidationMessage = {
        showInfo: false,
        message: '',
        doInfo: false
      };

      let validatedFields: ILinkValidFields = {
        '404': message,
        '301': message,
        url: message,
        mixedContent: message,
        xFrameOpts: message
      };

      //sync validators
      ngModel.$validators = {
        mixedContent: mixedContent,
        url: url
      };
      //async validator
      ngModel.$asyncValidators.xFrameOpts = xFrameOpts;

      if (ngModel) {
        scope.$watch(function () {
          return validatedFields;
        }, function (newVal, oldVal) {
          if (!angular.equals(newVal, oldVal)) {
            scope.onValidationNotice({$notice: newVal});
          }

        }, true);
      }

      function _emailOrPlaceholder(val) {
        return /mailto:/.test(val);
      }

      function mixedContent(viewVal) {

        if (ittUtils.existy(viewVal) && /^http:\/\//.test(viewVal)) {
          validatedFields['mixedContent'] = {message: 'Mixed Content Detected', showInfo: true}; //jshint ignore:line
        } else {
          validatedFields['mixedContent'] = {message: '', showInfo: false}; //jshint ignore:line
        }

        return true;
      }

      function url(viewVal) {
        if (ngModel.$isEmpty(viewVal) && !_emailOrPlaceholder(viewVal)) {
          validatedFields['url'] = {showInfo: true, message: 'Url cannot be blank'}; //jshint ignore:line
          return false;
        } else if (urlService.isVideoUrl(viewVal) || ittUtils.isValidURL(viewVal) || _emailOrPlaceholder(viewVal)) {
          validatedFields['url'] = {showInfo: false}; //jshint ignore:line
          return true;
        } else {
          validatedFields['url'] = {showInfo: true, message: viewVal + ' is not a valid URL'}; //jshint ignore:line
          return false;
        }

      }

      function xFrameOpts(viewVal) {
        //bail out if empty or link to youtube/kaltura/html5 video, mixed content, email or placeholder val
        if (ngModel.$isEmpty(viewVal) || urlService.isVideoUrl(viewVal) || /^http:\/\//.test(viewVal) || _emailOrPlaceholder(viewVal)) {
          return $q(function (resolve) {
            validatedFields['xFrameOpts'] = {showInfo: false}; //jshint ignore:line
            return resolve();
          });
        }

        return dataSvc.checkXFrameOpts(viewVal)
        //xFrameOptsObj will have at least x_frame_options field and could have response_code and location fields
          .then(function (xFrameOptsObj) {
            var tipText = '';
            //check for a new URL if we followed a redirect on the server.
            if (ittUtils.existy(xFrameOptsObj.location)) {
              tipText = viewVal + 'redirected to ' + xFrameOptsObj.location;
              validatedFields['301'] = {showInfo: true, message: tipText, doInfo: true, url: xFrameOptsObj.location}; //jshint ignore:line
            }

            if (ittUtils.existy(xFrameOptsObj.response_code) && xFrameOptsObj.response_code === 404) {
              tipText = viewVal + ' cannot be found';
              validatedFields['404'] = {showInfo: true, message: tipText};
              return $q.reject('404');
            }

            if (xFrameOptsObj.noEmbed) {
              tipText = 'Embedded link template is disabled because ' + viewVal + ' does not allow iframing';
              validatedFields['xFrameOpts'] = {showInfo: true, message: tipText, doInfo: true}; //jshint ignore:line
            } else {
              validatedFields['xFrameOpts'] = {showInfo: false}; //jshint ignore:line
            }

            //override noEmbed with error
            if (xFrameOptsObj.error_message) {
              validatedFields['xFrameOpts'] = {
                showInfo: true,
                message: viewVal + ' cannot be embedded: ' + xFrameOptsObj.error_message
              }; //jshint ignore:line
            }
          });
      }
    }
  };
}
