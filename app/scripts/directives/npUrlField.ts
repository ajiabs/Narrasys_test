import {
  ILinkValidationMessage,
  ILinkValidFields,
  IValidationSvc,
  IXFrameOptsResult,
  Partial
} from '../interfaces';
import { IEpisode, ILink, ILinkStatus } from '../models';

/**
 * Created by githop on 6/30/16.
 */

export type TUrlFieldContexts = 'episode' | 'producer' | 'editor' | 'editor-video';

const TEMPLATE = `
<div class="field">
  <div class="label">{{$ctrl.label || "URL"}}
    <span ng-repeat="(field, val) in $ctrl.validatedFields">
      <itt-validation-tip ng-if="val.showInfo" text="{{val.message}}" do-info="val.doInfo"></itt-validation-tip>
     </span>
  </div>
  <div class="input" ng-if="$ctrl.context !== 'episode'">
    <div  class="ittUrl__escapeLink">
      <input
        id="urlEscapeLink"
        type="checkbox"
        ng-change="$ctrl.updateTemplateOpts()"
        ng-true-value="'_blank'"
        ng-false-value="'_self'"
        ng-disabled="!$ctrl.canEmbed"
        ng-model="$ctrl.data.target"/>
      <span class="escapelink"></span>
      <label for="urlEscapeLink">Force new tab</label>

    </div>
    <input
      type="text"
      name="itemUrl"
      ng-change="$ctrl.onUrlFieldChange($ctrl.eventUrl)"
      ng-model="$ctrl.eventUrl"
      ng-model-options="{ updateOn: 'blur' }"/>
  </div>
  <div class="input" ng-if="$ctrl.context === 'episode'">
    <input
      type="text"
      ng-model="$ctrl.data"
      itt-valid-episode-url
      on-validation-notice="$ctrl.handleEpisodeValidationMessage($notice)"/>
    <button ng-if="$ctrl.data" ng-click="$ctrl.onAttach({$url: $ctrl.data})">Attach Video</button>
  </div>
</div>
`;

interface IUrlFieldBindings extends ng.IComponentController {
  data: ILink | IEpisode;
  eventUrl?: string;
  context: 'episode' | 'producer' | 'editor' | 'editor-video';
  label: string;
  onAttach: (ev) => ({$url: string});
  ittItemForm: ng.IFormController;
}

class UrlFieldController implements IUrlFieldBindings {
  data: ILink;
  context: 'episode' | 'producer' | 'editor' | 'editor-video' = 'producer';
  label: string;
  eventUrl: string;
  onAttach: (ev) => ({$url: string});
  ittItemForm: ng.IFormController;
  validatedFields: Partial<ILinkValidFields> = {
    url: null,
    iframeHeaders: null,
    '404': null,
    '301': null,
    mixedContent: null
  };
  message: ILinkValidationMessage = {
    showInfo: false,
    message: '',
    doInfo: false
  };
  canEmbed: boolean;

  static $inject = ['$q', 'ittUtils', 'validationSvc'];
  constructor(
    private $q: ng.IQService,
    private ittUtils,
    private validationSvc: IValidationSvc) {
    //
  }

  $onInit() {
    //
    this.eventUrl = this.data.url;
    if (this.eventUrl !== 'https://') {
      this.itemUrlValidationPipeline(this.eventUrl, this.data.url_status, this.context);
    }
  }

  itemUrlValidationPipeline(url: string, cachedResults?: ILinkStatus, context?: TUrlFieldContexts): void {
    this._resetFields();
    const isValidUrl = this._setValidity(this.validationSvc.validateUrl(url, this));

    if (isValidUrl) { //only do async stuff if necessary
      this.inspectHeaders(url, cachedResults, context);
    }
  }

  updateTemplateOpts() {
    this.data.templateOpts = this._disableTemplateOpts(this.data.target === '_blank');
  }

  onUrlFieldChange(url: string) {
    if (url === 'https://') {
      this._setValidity(false);
      return;
    }

    this.itemUrlValidationPipeline(url, null, this.context);
  }

  async inspectHeaders(url, cachedResults, context?: TUrlFieldContexts) {
    try {
      const {
        canEmbed,
        location,
        urlStatus
      }: IXFrameOptsResult = await this.validationSvc.inspectHeadersAsync(url, this, cachedResults, context);

      this._setValidity(true);
      const isMixedContent = this.validationSvc.mixedContent(location || url, this);
      //since all HTTP links are checked, it is possible that the target site
      //allows for iframing, but is not served from a secure context so it would not
      //be iframeable in our app.
      this.canEmbed = canEmbed && !isMixedContent;
      if (!this.canEmbed) {
        this.data.target = '_blank';
      }
      this.data.templateOpts = this._disableTemplateOpts(!this.canEmbed);
      this.data.url_status = Object.assign(new ILinkStatus(), urlStatus);
      this.data.url = location || url;
      this.eventUrl = this.data.url;
    } catch (e) {
      this._setValidity(false);
    }
  }

  handleEpisodeValidationMessage(notice) {
    this.validatedFields = {
      kaltura: null,
      youtube: null,
      html5: null,
      error: null
    };
    Object.assign(this.validatedFields, notice);
  }

  private _disableTemplateOpts(val: boolean): any[] {
    if (val === true) {
      this.data.showInlineDetail = false;
    }

    if (this.context === 'editor' || this.context === 'editor-video') {
      //editors do not have the option to specify the template.
      return;
    }

    return this.data.templateOpts.map((opt) => {
      if (opt.name === 'Embedded link' || opt.name === 'Link modal') {
        opt.isDisabled = val;
      }
      return opt;
    });
  }

  private _setValidity(val: boolean, field: string = 'itemUrl', controller = this): boolean {
    controller.ittItemForm.$setValidity(field, val, null);
    return val;
  }

  private _resetFields(): void {
    Object.keys(this.validatedFields)
      .forEach((key: string) => this.validatedFields[key] = this.message);
  }
}

export class UrlField implements ng.IComponentOptions {
  bindings: any = {
    data: '=',
    context: '@?',
    label: '@',
    onAttach: '&',
    ittItemForm: '<?'
  };
  template: string = TEMPLATE;
  controller = UrlFieldController;
  static Name: string = 'npUrlField'; // tslint:disable-line
}
/* tslint:disable */
// export default function ittUrlField() {
//   return {
//     restrict: 'EA',
//     scope: {
//       data: '=',
//       context: '@?',
//       label: '@',
//       onAttach: '&',
//       ittItemForm: '<?'
//     },
//     template: `
// <div class="field">
//   <div class="label">{{$ctrl.label || "URL"}}
//     <span ng-repeat="(field, val) in $ctrl.validatedFields">
//       <itt-validation-tip ng-if="val.showInfo" text="{{val.message}}" do-info="val.doInfo"></itt-validation-tip>
//      </span>
//   </div>
//   <div class="input" ng-if="$ctrl.context !== 'episode'">
//     <div ng-if="$ctrl.canEmbed" class="ittUrl__escapeLink">
//
//       <input
//         id="urlEscapeLink"
//         type="checkbox"
//         ng-change="$ctrl.updateTemplateOpts()"
//         ng-true-value="'_blank'"
//         ng-false-value="'_self'"
//         ng-model="$ctrl.data.target"/>
//       <span class="escapelink"></span>
//       <label for="urlEscapeLink">Force new tab</label>
//
//     </div>
//     <input
//       type="text"
//       name="itemUrl"
//       ng-model="$ctrl.data.url"
//       ng-model-options="{ updateOn: \'blur\' }"/>
//   </div>
//   <div class="input" ng-if="$ctrl.context === 'episode'">
//     <input
//       type="text"
//       ng-model="$ctrl.data"
//       itt-valid-episode-url
//       on-validation-notice="$ctrl.handleEpisodeValidationMessage($notice)"/>
//     <button ng-if="$ctrl.data" ng-click="$ctrl.onAttach({$url: $ctrl.data})">Attach Video</button>
//   </div>
// </div>`,
//     controller: ['$scope', '$q', 'ittUtils', 'validationSvc',
//       function ($scope: IUrlFieldScope, $q: ng.IQService, ittUtils, validationSvc: IValidationSvc) {
//         const ctrl: IUrlFieldScope = this;
//         const _existy = ittUtils.existy;
//
//         let validatedFields: Partial<ILinkValidFields> = {
//           url: null,
//           iframeHeaders: null,
//           '404': null,
//           '301': null,
//           mixedContent: null
//         };
//
//         let message: ILinkValidationMessage = {
//           showInfo: false,
//           message: '',
//           doInfo: false
//         };
//
//         angular.extend(ctrl, {
//           //props
//           validatedFields,
//           //ng lifecyclelhooks
//           $onInit,
//           $onDestroy,
//           //methods
//           handleEpisodeValidationMessage,
//           updateTemplateOpts
//         });
//
//         let $watchItemUrl = angular.noop;
//
//         function $onInit() {
//           if (ctrl.context == null) {
//             //default to producer
//             ctrl.context = 'producer';
//           }
//           if (ctrl.context !== 'episode') {
//             //run once on initial value and setup watch, if initial value isn't
//             //the default value (e.g. 'https://') for new link events
//             //ctrl.data will be a string literal when the context is episode and an object (link event)
//             //when the context is producer/editor
//             if (typeof ctrl.data !== 'string' && ctrl.data.url !== 'https://') {
//               itemUrlValidationPipeline(ctrl.data.url, ctrl.data.url_status, ctrl.context);
//             }
//             subscribeWatch();
//           }
//         }
//
//         function $onDestroy() {
//           if (ctrl.context !== 'episode') {
//             unsubscribeWatch();
//           }
//         }
//
//         function subscribeWatch() {
//           $watchItemUrl = $scope.$watch(watchItemUrl, handleChanges);
//         }
//
//         function unsubscribeWatch() {
//           $watchItemUrl();
//         }
//
//         function updateTemplateOpts() {
//           ctrl.data.templateOpts = _disableTemplateOpts(ctrl.data.target === '_blank');
//         }
//
//         function watchItemUrl() {
//           return ctrl.data.url;
//         }
//
//         function handleChanges(nextUrl, origUrl) {
//           if (nextUrl === 'https://') { //consider initial value 'not valid', i.e. make them input something.
//             _setValidity(false);
//             return;
//           }
//           if (nextUrl !== origUrl) {
//             itemUrlValidationPipeline(nextUrl, null, ctrl.context);
//           }
//         }
//
//         function itemUrlValidationPipeline(url: string, cachedResults?: ILinkStatus, context?: TUrlFieldContexts): void {
//           _resetFields();
//           let isValidUrl = _setValidity(validationSvc.validateUrl(url, ctrl));
//           // let isMixedContent = validationSvc.mixedContent(url, ctrl);
//           // ctrl.data.templateOpts = _disableTemplateOpts(isMixedContent);
//           if (isValidUrl) { //only do async stuff if necessary
//             inspectHeaders(url, cachedResults, context);
//           }
//         }
//
//         async function inspectHeaders(url, cachedResults, context?: TUrlFieldContexts) {
//           try {
//             const {
//               canEmbed,
//               location,
//               urlStatus
//             }: IXFrameOptsResult = await validationSvc.inspectHeadersAsync(url, ctrl, cachedResults, context);
//
//             _setValidity(true);
//             let isMixedContent = validationSvc.mixedContent(location || url, ctrl);
//             //since all HTTP links are checked, it is possible that the target site
//             //allows for iframing, but is not served from a secure context so it would not
//             //be iframeable in our app.
//             ctrl.canEmbed = canEmbed && !isMixedContent;
//             ctrl.data.templateOpts = _disableTemplateOpts(!ctrl.canEmbed);
//             ctrl.data.url_status = Object.assign(new ILinkStatus(), urlStatus);
//
//             if (_existy(location)) {
//               //turn off watch for a moment to avoid triggering
//               //a $digest from mutating ctrl.data.url
//               unsubscribeWatch();
//               ctrl.data.url = location;
//               subscribeWatch();
//             }
//           } catch (e) {
//             _setValidity(false);
//           }
//         }
//
//         function _disableTemplateOpts(val: boolean): any[] {
//
//           if (val === true) {
//             ctrl.data.showInlineDetail = false;
//           }
//
//           if (ctrl.context === 'editor' || ctrl.context === 'editor-video') {
//             //editors do not have the option to specify the template.
//             return;
//           }
//
//           return ctrl.data.templateOpts.map(function (opt) {
//             if (opt.name === 'Embedded link' || opt.name === 'Link modal') {
//               opt.isDisabled = val;
//             }
//             return opt
//           });
//         }
//
//         //validation of episode URLs in episode tab still use old pattern; e.g. custom validator that emits
//         //a message
//         function handleEpisodeValidationMessage(notice) {
//           ctrl.validatedFields = {
//             kaltura: null,
//             youtube: null,
//             html5: null,
//             error: null
//           };
//           angular.extend(ctrl.validatedFields, notice);
//         }
//
//         //private methods
//
//
//         function _resetFields(): void {
//           Object.keys(validatedFields)
//             .forEach(key => validatedFields[key] = message);
//         }
//
//         function _setValidity(val: boolean, field: string = 'itemUrl', controller = ctrl): boolean {
//           controller.ittItemForm.$setValidity(field, val);
//           return val;
//         }
//
//
//       }],
//     controllerAs: '$ctrl',
//     bindToController: true
//   };
// }

