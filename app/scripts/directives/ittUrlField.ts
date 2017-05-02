import {ILink, ILinkStatus} from '../models';
/**
 * Created by githop on 6/30/16.
 */

//link event
interface IUrlFieldScope extends ng.IScope {
  data: ILink;
  videoOnly: boolean;
  label: string;
  onAttach: ($url: string) => string;
  ittItemForm?: ng.INgModelController
}

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
        <div class="label">Force open in new Tab
          <div class="input">
            <input type="checkbox" ng-model="$ctrl.data.noEmbed">
          </div>
        </div>
      </div>
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
      function ($scope: IUrlFieldScope, $q: ng.IQService, ittUtils, urlService, dataSvc) {
        const ctrl: IUrlFieldScope = this;
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
            //run once on initial value and setup watch, if initial value isn't
            //the default value (e.g. 'https://') for new link events
            if (_existy(ctrl.data.url) && ctrl.data.url !== 'https://') {
              itemUrlValidationPipeline(ctrl.data.url, ctrl.data.url_status);
            }
            subscribeWatch();
          }
        }

        function $onDestroy() {
          if (!ctrl.videoOnly) {
            unsubscribeWatch();
          }
        }

        function subscribeWatch() {
          $watchItemUrl = $scope.$watch(watchItemUrl, handleChanges);
        }

        function unsubscribeWatch() {
          $watchItemUrl();
        }

        function watchItemUrl() {
          return ctrl.data.url;
        }

        function handleChanges(nextUrl, origUrl) {
          if (nextUrl === 'https://') { //consider initial value 'not valid', i.e. make them input something.
            _setValidity(false);
            return;
          }
          if (nextUrl !== origUrl) {
            itemUrlValidationPipeline(nextUrl);
          }
        }

        function itemUrlValidationPipeline(url: string, cachedResults?: ILinkStatus): void {
          _resetFields();
          let isValidUrl = _setValidity(validateUrl(url));
          let isMixedContent = mixedContent(url);
          ctrl.data.templateOpts = _disableTemplateOpts(isMixedContent);
          if (!isMixedContent && isValidUrl) { //only do async stuff if necessary
            xFrameOpts(url, cachedResults)
              .then(({noEmbed, location}: {noEmbed:boolean, location:string}) => {
                ctrl.data.templateOpts = _disableTemplateOpts(noEmbed);
                _setValidity(true);
                ctrl.data.noEmbed = noEmbed;
                if (_existy(location)) {
                  //turn off watch for a moment to avoid triggering
                  //a $digest from mutating ctrl.data.url
                  unsubscribeWatch();
                  ctrl.data.url = location;
                  subscribeWatch();
                }
              })
              .catch(_ => _setValidity(false));
          }
        }

        function _disableTemplateOpts(val: boolean): any[] {

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

        function mixedContent(viewVal: string): boolean {
          if (_existy(viewVal) && /^http:\/\//.test(viewVal)) {
            //mixed content detected!
            ctrl.validatedFields['mixedContent'] = {message: 'Mixed Content Detected', showInfo: true};
            return true;
          } else {
            ctrl.validatedFields['mixedContent'] = {message: '', showInfo: false};
            return false;
          }
        }

        function validateUrl(viewVal: string): boolean {
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

        function xFrameOpts(viewVal: string, cachedResults?: ILinkStatus): ng.IPromise<{noEmbed: boolean, location: string | null}> {

          if (cachedResults != null) {

            return $q((resolve) => {
              let ret = {
                noEmbed: dataSvc.handleXFrameOptionsHeader(viewVal, cachedResults.x_frame_options)
              };
              return resolve(handleXframeOptsObj(viewVal, ret));
            });
          }

          //bail out if empty or link to youtube/kaltura/html5 video, mixed content, email or placeholder val
          if (viewVal === '' || urlService.isVideoUrl(viewVal) || /^http:\/\//.test(viewVal) || _emailOrPlaceholder(viewVal)) {
            return $q(function (resolve) {
              ctrl.validatedFields['xFrameOpts'] = {showInfo: false};
              return resolve({noEmbed: false, location: null});
            });
          }

          return dataSvc.checkXFrameOpts(viewVal)
          //xFrameOptsObj will have at least x_frame_options field and could have response_code and location fields
            .then(xFrameOptsObj => handleXframeOptsObj(viewVal, xFrameOptsObj));
        }

        function handleXframeOptsObj(viewVal: string, xFrameOptsObj) {
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
          return {noEmbed: xFrameOptsObj.noEmbed, location: xFrameOptsObj.location};
        }

        //validation of episode URLs in episode tab still use old pattern; e.g. custom validator that emits
        //a message
        function handleEpisodeValidationMessage(notice) {
          ctrl.validatedFields = {
            kaltura: null,
            youtube: null,
            html5: null,
            error: null
          };
          angular.extend(ctrl.validatedFields, notice);
        }

        //private methods
        function _emailOrPlaceholder(val: string): boolean {
          return /mailto:/.test(val) || val === 'https://';
        }

        function _resetFields(): void {
          Object.keys(validatedFields)
            .forEach(key => validatedFields[key] = message);
        }

        function _setValidity(val: boolean, field: string = 'itemUrl', controller = ctrl): boolean {
          controller.ittItemForm.$setValidity(field, val);
          return val;
        }


      }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}

