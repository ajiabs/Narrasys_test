import {ILink, ILinkStatus} from '../models';
import {IValidationSvc} from '../services/validation.svc';
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
      <div class="field" ng-if="$ctrl.canEmbed">
        <div class="label">Force open in new Tab
          <div class="input">
            <input
            type="checkbox"
            ng-true-value="'_blank'"
            ng-false-value="'_self'"
            ng-model="$ctrl.data.target"/>

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
    controller: ['$scope', '$q', 'ittUtils', 'validationSvc',
      function ($scope: IUrlFieldScope, $q: ng.IQService, ittUtils, validationSvc: IValidationSvc) {
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
          let isValidUrl = _setValidity(validationSvc.validateUrl(url, ctrl));
          // let isMixedContent = validationSvc.mixedContent(url, ctrl);
          // ctrl.data.templateOpts = _disableTemplateOpts(isMixedContent);
          if (isValidUrl) { //only do async stuff if necessary
            validationSvc.xFrameOpts(url, ctrl, cachedResults)
              .then(({canEmbed, location}: {canEmbed:boolean, location:string}) => {
                ctrl.data.templateOpts = _disableTemplateOpts(canEmbed);
                _setValidity(true);
                // ctrl.data.noEmbed = noEmbed;
                // ctrl.data.target = _setTarget(noEmbed);

                ctrl.canEmbed = canEmbed;

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

