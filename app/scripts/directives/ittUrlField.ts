import {ILinkValidationMessage, ILinkValidFields} from "../interfaces";
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
      onAttach: '&'
    },
    template: `
      <div class="field">
      	<div class="label">{{$ctrl.label || "URL"}}
      	<span ng-repeat="(field, val) in $ctrl.validatedFields">
      		<itt-validation-tip ng-if="val.showInfo" text="{{val.message}}" do-info="val.doInfo"></itt-validation-tip>
      	</span>
      	</div>
      	<div class="input" ng-if="!$ctrl.videoOnly">
      		<input type="text" name="itemUrl" ng-model="$ctrl.data.url" ng-focus="$ctrl.onFocus()" ng-model-options="{ updateOn: \'blur\' }"  itt-valid-item-url on-validation-notice="$ctrl.handleItemValidationMessage($notice)"/>
      	</div>
      	<div class="input" ng-if="$ctrl.videoOnly === true">
      		<input type="text" ng-model="$ctrl.data" itt-valid-episode-url on-validation-notice="$ctrl.handleEpisodeValidationMessage($notice)"/>
      		<button ng-if="$ctrl.data" ng-click="$ctrl.onAttach({$url: $ctrl.data})">Attach Video</button>
      	</div>
      </div>`,
    controller: ['$scope', function ($scope) {
      var ctrl = this;
      ctrl.handleItemValidationMessage = handleItemValidationMessage;
      ctrl.handleEpisodeValidationMessage = handleEpisodeValidationMessage;
      ctrl.onFocus = onFocus;

      function onFocus() {
        let reset: ILinkValidationMessage = {showInfo: false, doInfo: false, message: ''};

        ctrl.validatedFields = {
          '404': reset,
          '301': reset,
          'xFrameOpts': reset
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

      function handleItemValidationMessage(notice) {
        ctrl.validatedFields = <ILinkValidFields> {
          url: null,
          xFrameOpts: null,
          '404': null,
          '301': null,
          mixedContent: null
        };

        angular.extend(ctrl.validatedFields, notice);

        const {
          xFrameOpts: { showInfo: xShowInfo },
          mixedContent: { showInfo: mShowInfo }
        } = ctrl.validatedFields;

        const xFrameOptsdisableEmbedTemplates = xShowInfo === true && mShowInfo === false;
        const mixedContentDisableEmbedTemplates = xShowInfo === false && mShowInfo === true;

        const disableEmbedTemplates = (xFrameOptsdisableEmbedTemplates || mixedContentDisableEmbedTemplates);

        ctrl.data.noEmbed = disableEmbedTemplates;
        ctrl.data.templateOpts = _setTemplateOpts(disableEmbedTemplates);

        if (disableEmbedTemplates === false) {
          ctrl.data.showInlineDetail = false;
        }

        if (ctrl.validatedFields.url.showInfo === true) {
          ctrl.data.noEmbed = false;
        }

        if (ctrl.validatedFields['301'].showInfo === true) {
          ctrl.data.url = ctrl.validatedFields['301'].url;
        }
      }

      function _setTemplateOpts(disable: boolean): any[] {
        return ctrl.data.templateOpts.map((opt) => {
          if (opt.name === 'Embedded link' || opt.name === 'Link modal') {
            opt.isDisabled = disable;
          }
          return opt;
        });
      }
    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}

