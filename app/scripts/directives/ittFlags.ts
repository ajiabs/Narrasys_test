/**
 * Created by githop on 6/30/16.
 */
import {IEvent} from '../models';
import {ISelectService} from '../services/selectService';
import {existy} from '../services/ittUtils';

const TEMPLATE = ``;

interface IFlagsBindings {
  flags: string[];
  data: IEvent;
  itemForm: ng.IFormController;
  templateUrl: string;
}

class FlagsController implements ng.IComponentController, IFlagsBindings {
  flags: string[];
  data: IEvent;
  itemForm: ng.IFormController;
  templateUrl: string;

  private _flags: string[];
  private _displays = {
    required: 'Required',
    stop: 'Stop item',
    cosmetic: 'Cosmetic',
    chapter_marker: 'Chapter Event',
    invertColor: 'Invert Color'
  };

  private _ids = {
    required: 'itemRequired',
    stop: 'itemStop',
    cosmetic: 'itemCosmetic',
    chapter_marker: 'itemChapter',
    invertColor: 'Invert'
  };

  static $inject = ['selectService'];
  constructor(private selectService: ISelectService) {
    //
  }

  $onInit() {
    this._flags = angular.copy(this.flags);
  }

  $onChanges(changesObj) {
    // call setFlags
  }

  handleChange() {
    if (this.data.hasOwnProperty('stop')) {
      this.selectService.onSelectChange(this.data, this.itemForm);
    }
  }

  private static _h1OrH2(url) {
    return (url === 'templates/item/text-h1.html' || url === 'templates/item/text-h2.html');
  }

  private setFlags(newVal:string, oldVal:string) {

    //reset invert color when switching between templates.
    if (newVal !== oldVal) {
      this.itemForm.color = '';
    }

    if (newVal) {
      if (this.data.templateUrl === 'templates/item/image-fill.html') {
        this._flags = this._flags.filter(function (f) {
          return f !== 'stop';
        });
      } else {
        this._flags = this.flags;
      }
      if (!FlagsController._h1OrH2(newVal)) {
        //editing non-h1/h2, reset invert
        //when adding any new annotation, the invert color will be set as H2 by default (and
        //h2s by default have the invert color applied)
        //reset it for non h1/h2 annotations
        if (existy(this.itemForm) && this.data._id === 'internal:editing') {
          this.itemForm.color = '';

        }

        this._flags = this._flags.filter(function (f) {
          return f !== 'chapter_marker' && f !== 'invertColor';
        });
      } else {
        this._flags = this.flags;
        //set invert for new h1/h2 as default.
        if (existy(this.itemForm) && this.data._id === 'internal:editing') {
          this.itemForm.color = 'Invert';
        }
      }
    }
  }
}

export class Flags implements ng.IComponentOptions {
  bindings: any = {};
  template: string = TEMPLATE;
  controller = FlagsController;
  static Name: string = 'npFlags'; // tslint:disable-line
}

export default function ittFlags() {
  return {
    restrict: 'EA',
    scope: {
      flags: '<',
      data: '=',
      //for the invertColor option
      itemForm: '=?'
    },
    template: [
      '<div class="field">',
      '	<div class="label">Flags</div>',
      '	<div class="input">',
      '		<span ng-repeat="flag in $ctrl._flags">',
      '			<span ng-if="flag !== \'invertColor\'">',
      '				<label for="{{$ctrl._ids[flag]}}"></label>',
      '				<input id="{{$ctrl._ids[flag]}}" type="checkbox" itt-dynamic-model="\'$ctrl.data.\' + flag" ng-change="$ctrl.handleChange()"/>{{$ctrl._displays[flag]}}',
      '			</span>',
      '			<span ng-if="flag === \'invertColor\'">',
      '				<label for="{{$ctrl._ids[flag]}}"></label>',
      '				<input id="{{$ctrl._ids[flag]}}" type="checkbox" ng-model="$ctrl.itemForm.color" ng-true-value="\'Invert\'" ng-false-value="\'\'" ng-change="$ctrl.handleChange()"/>{{$ctrl._displays[flag]}}',
      '			</span>',
      '		</span>',
      '	</div>',
      '</div>'
    ].join(' '),
    controller: ['$scope', 'selectService', 'ittUtils', function ($scope, selectService, ittUtils) {
      var ctrl = this;
      ctrl._flags = angular.copy(ctrl.flags);
      ctrl.handleChange = handleChange;
      ctrl._displays = {
        required: 'Required',
        stop: 'Stop item',
        cosmetic: 'Cosmetic',
        chapter_marker: 'Chapter Event',
        invertColor: 'Invert Color'
      };
      ctrl._ids = {
        required: 'itemRequired',
        stop: 'itemStop',
        cosmetic: 'itemCosmetic',
        chapter_marker: 'itemChapter',
        invertColor: 'Invert'
      };

      $scope.$watch(watchTemplateUrl, setFlags);

      function handleChange() {
        if (ctrl.data.hasOwnProperty('stop')) {
          selectService.onSelectChange(ctrl.data, ctrl.itemForm);
        }
      }

      function _h1OrH2(url) {
        return (url === 'templates/item/text-h1.html' || url === 'templates/item/text-h2.html');
      }

      function watchTemplateUrl() {
        return ctrl.data.templateUrl;
      }

      function setFlags(newVal, oldVal) {

        //reset invert color when switching between templates.
        if (newVal !== oldVal) {
          ctrl.itemForm.color = '';
        }

        if (newVal) {
          if (ctrl.data.templateUrl === 'templates/item/image-fill.html') {
            ctrl._flags = ctrl._flags.filter(function (f) {
              return f !== 'stop';
            });
          } else {
            ctrl._flags = ctrl.flags;
          }

          if (!_h1OrH2(newVal)) {
            //editing non-h1/h2, reset invert
            //when adding any new annotation, the invert color will be set as H2 by default (and
            //h2s by default have the invert color applied)
            //reset it for non h1/h2 annotations
            if (ittUtils.existy(ctrl.itemForm) && ctrl.data._id === 'internal:editing') {
              ctrl.itemForm.color = '';

            }

            ctrl._flags = ctrl._flags.filter(function (f) {
              return f !== 'chapter_marker' && f !== 'invertColor';
            });
          } else {
            ctrl._flags = ctrl.flags;
            //set invert for new h1/h2 as default.
            if (ittUtils.existy(ctrl.itemForm) && ctrl.data._id === 'internal:editing') {
              ctrl.itemForm.color = 'Invert';
            }
          }
        }
      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
