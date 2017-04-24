/**
 * Created by githop on 6/30/16.
 */



export default function ittUrlField() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      videoOnly: '=',
      label: '@',
      onAttach: '&',
      ittItemForm: '<?'
    },
    template: `
      <div class="field">
      	<div class="label">{{$ctrl.label || "URL"}}
      	<span ng-repeat="(field, val) in $ctrl.validatedFields">
      		<itt-validation-tip ng-if="val.showInfo" text="{{val.message}}" do-info="val.doInfo"></itt-validation-tip>
      	</span>
      	</div>
      	<div class="input" ng-if="!$ctrl.videoOnly">
      		<input
      		  type="text"
      		  name="itemUrl"
      		  ng-model="$ctrl.data.url"
      		  ng-model-options="{ updateOn: \'blur\' }"/>
      	</div>
      	<div class="input" ng-if="$ctrl.videoOnly === true">
      		<input
      		  type="text"
      		  ng-model="$ctrl.data"
      		  itt-valid-episode-url
      		  on-validation-notice="$ctrl.handleEpisodeValidationMessage($notice)"/>
      		<button ng-if="$ctrl.data" ng-click="$ctrl.onAttach({$url: $ctrl.data})">Attach Video</button>
      	</div>
      </div>`,
    controller: ['$scope', '$q', 'ittUtils', 'urlService', 'dataSvc',
      function ($scope: ng.IScope, $q: ng.IQService, ittUtils, urlService, dataSvc) {
        const ctrl = this;
        const _existy = ittUtils.existy;

        let validatedFields = {
          url: null,
          xFrameOpts: null,
          '404': null,
          '301': null,
          mixedContent: null
        };

        let message = {
          showInfo: false,
          message: '',
          doInfo: false
        };

        angular.extend(ctrl, {
          //props
          validatedFields,
          //ng lifecyclelhooks
          $onInit,
          $onDestroy,
          //methods
          handleEpisodeValidationMessage,
        });

        let $watchItemUrl = angular.noop;

        function $onInit() {
          if (!ctrl.videoOnly) {
            $watchItemUrl = $scope.$watch(watchItemUrl, handleChanges);
          }
        }

        function $onDestroy() {
          if (!ctrl.videoOnly) {
            $watchItemUrl();
          }
        }

        function watchItemUrl() {
          return ctrl.data.url;
        }

        function handleChanges(nextUrl) {
          _resetFields();
          let isValidUrl = _setValidity(url(nextUrl));
          let isMixed = mixedContent(nextUrl);
          ctrl.data.templateOpts = _disableTemplateOpts(!isMixed);
          if (nextUrl === 'https://') { //consider initial value 'not valid', i.e. make them input something.
            _setValidity(false);
            return;
          }

          if (isMixed && isValidUrl) { //only do async stuff if necessary
            xFrameOpts(nextUrl)
              .then((noEmbed: boolean) => {
                ctrl.data.templateOpts = _disableTemplateOpts(noEmbed);
                _setValidity(true);
                ctrl.data.noEmbed = noEmbed;
              })
              .catch(_ => _setValidity(false));
          }
        }

        function _disableTemplateOpts(val: boolean) {

          if (val === true) {
            ctrl.data.showInlineDetail = false;
          }

          return ctrl.data.templateOpts.map(function (opt) {
            if (opt.name === 'Embedded link' || opt.name === 'Link modal') {
              opt.isDisabled = val;
            }
            return opt
          });
        }

        function mixedContent(viewVal) {
          if (_existy(viewVal) && /^http:\/\//.test(viewVal)) {
            //mixed content detected!
            ctrl.validatedFields['mixedContent'] = {message: 'Mixed Content Detected', showInfo: true};
            return false;
          } else {
            ctrl.validatedFields['mixedContent'] = {message: '', showInfo: false};
            return true;
          }
        }

        function url(viewVal) {
          if (viewVal === '' && !_emailOrPlaceholder(viewVal)) {
            ctrl.validatedFields['url'] = {showInfo: true, message: 'Url cannot be blank'};
            return false;
          } else if (urlService.isVideoUrl(viewVal) || ittUtils.isValidURL(viewVal) || _emailOrPlaceholder(viewVal)) {
            ctrl.validatedFields['url'] = {showInfo: false};
            return true;
          } else {
            ctrl.validatedFields['url'] = {showInfo: true, message: viewVal + ' is not a valid URL'}; //jshint ignore:line
            return false;
          }
        }

        function handleEpisodeValidationMessage(notice) {
          ctrl.validatedFields = {
            kaltura: null,
            youtube: null,
            html5: null,
            error: null
          };
          angular.extend(ctrl.validatedFields, notice);
        }

        function xFrameOpts(viewVal) {
          //bail out if empty or link to youtube/kaltura/html5 video, mixed content, email or placeholder val
          if (viewVal === '' || urlService.isVideoUrl(viewVal) || /^http:\/\//.test(viewVal) || _emailOrPlaceholder(viewVal)) {
            return $q(function (resolve) {
              ctrl.validatedFields['xFrameOpts'] = {showInfo: false};
              return resolve();
            });
          }

          return dataSvc.checkXFrameOpts(viewVal)
          //xFrameOptsObj will have at least x_frame_options field and could have response_code and location fields
            .then(function (xFrameOptsObj) {
              let tipText = '';
              //check for a new URL if we followed a redirect on the server.
              if (ittUtils.existy(xFrameOptsObj.location)) {
                tipText = viewVal + ' redirected to ' + xFrameOptsObj.location;
                ctrl.validatedFields['301'] = {
                  showInfo: true,
                  message: tipText,
                  doInfo: true,
                  url: xFrameOptsObj.location
                };
              }

              if (ittUtils.existy(xFrameOptsObj.response_code) && xFrameOptsObj.response_code === 404) {
                tipText = viewVal + ' cannot be found';
                ctrl.validatedFields['404'] = {showInfo: true, message: tipText};
                return $q.reject('404');
              }

              if (xFrameOptsObj.noEmbed) {
                tipText = 'Embedded link template is disabled because ' + viewVal + ' does not allow iframing';
                ctrl.validatedFields['xFrameOpts'] = {showInfo: true, message: tipText, doInfo: true};
              } else {
                ctrl.validatedFields['xFrameOpts'] = {showInfo: false};
              }

              //override noEmbed with error
              if (xFrameOptsObj.error_message) {
                ctrl.validatedFields['xFrameOpts'] = {
                  showInfo: true,
                  message: viewVal + ' cannot be embedded: ' + xFrameOptsObj.error_message
                };
              }
              return xFrameOptsObj.noEmbed;
            });
        }
        //private methods
        function _emailOrPlaceholder(val) {
          return /mailto:/.test(val) || val === 'https://';
        }

        function _resetFields() {
          Object.keys(validatedFields)
            .forEach(key => validatedFields[key] = message);
        }

        function _setValidity(val: boolean, field: string = 'itemUrl'): boolean {
          ctrl.ittItemForm.$setValidity(field, val);
          return val;
        }


      }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}

