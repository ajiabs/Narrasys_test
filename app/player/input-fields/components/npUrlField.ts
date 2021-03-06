// @npUpgrade-inputFields-true
import {
  ILinkValidationMessage,
  ILinkValidFields,
  IValidationSvc,
  IXFrameOptsResult,
  Partial
} from '../../../interfaces';
import { IEpisode, IEvent, ILink, ILinkStatus } from '../../../models';
import { EventTemplates } from '../../../constants';

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
        ng-change="$ctrl.onForceNewTabChange()"
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
      ng-blur="$ctrl.onUrlFieldChange($ctrl.eventUrl)"
      ng-focus="$ctrl.onFocused()"
      ng-model="$ctrl.eventUrl"/>
  </div>
  <div class="input" ng-if="$ctrl.context === 'episode'">
    <input
      type="text"
      ng-model="$ctrl.data"
      np-valid-episode-url
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
  onUpdate: () => void;
  ittItemForm: ng.IFormController;
}

class UrlFieldController implements IUrlFieldBindings {
  data: ILink;
  context: 'episode' | 'producer' | 'editor' | 'editor-video';
  label: string;
  eventUrl: string;
  onAttach: (ev) => ({$url: string});
  onUpdate: () => void;
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

  static $inject = ['$timeout','validationSvc'];
  constructor(
    private $timeout: ng.ITimeoutService,
    private validationSvc: IValidationSvc) {
    //
  }

  $onInit() {
    if (this.data && this.data.url) {
      this.eventUrl = this.data.url;


      if (this.context == null) {
        this.context = 'producer';
      }

      if (this.context !== 'episode') {
        this.onUrlFieldChange(this.eventUrl, this.data.url_status);
      }
    }
  }

  updateTemplateOpts(): void {
    this.data.templateOpts = this._disableTemplateOpts(this.data.target === '_blank');
  }

  onFocused(): void {
    // if user focuses input, eagerly set form to invalid and allow blur event to handle recovery
    this._setValidity(false);
  }

  onForceNewTabChange() {
    this.updateTemplateOpts();
    this.onUpdate();
  }

  onUrlFieldChange(url: string, urlStatus?: ILinkStatus): void {
    if (url === 'https://') {
      this._setValidity(false);
      return;
    }

    this._itemUrlValidationPipeline(url, urlStatus, this.context);
    // this.$timeout(() => {
    //
    // });
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

  private async _inspectHeaders(url, cachedResults, context?: TUrlFieldContexts) {
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
      this.updateTemplateOpts();
      this.data.url_status = Object.assign(new ILinkStatus(), urlStatus);
      this.data.url = location || url;
      this.eventUrl = this.data.url;
    } catch (e) {
      this._setValidity(false);
    }
  }

  private _itemUrlValidationPipeline(url: string, cachedResults?: ILinkStatus, context?: TUrlFieldContexts): void {
    this._resetFields();
    const isValidUrl = this._setValidity(this.validationSvc.validateUrl(url, this));

    if (isValidUrl) { //only do async stuff if necessary
      this._inspectHeaders(url, cachedResults, context)
        .then(() => this.onUpdate());
    } else {
      this.onUpdate();
    }
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
      if (opt.component_name === EventTemplates.LINK_EMBED_TEMPLATE ||
          opt.component_name === EventTemplates.LINK_MODAL_THUMB_TEMPLATE) {
        opt.isDisabled = val;
      }
      return opt;
    });
  }

  private _setValidity(val: boolean, field: string = 'itemUrl'): boolean {
    if (this.ittItemForm != null) {
      this.ittItemForm.$setValidity(field, val, null);
    }
    return val;
  }

  private _resetFields(): void {
    Object.keys(this.validatedFields)
      .forEach((key: string) => this.validatedFields[key] = this.message);
  }
}

export class UrlField implements ng.IComponentOptions {
  bindings: any = {
    data: '<',
    context: '@?',
    label: '@',
    onAttach: '&',
    ittItemForm: '<?',
    onUpdate: '&?'
  };
  template: string = TEMPLATE;
  controller = UrlFieldController;
  static Name: string = 'npUrlField'; // tslint:disable-line
}
