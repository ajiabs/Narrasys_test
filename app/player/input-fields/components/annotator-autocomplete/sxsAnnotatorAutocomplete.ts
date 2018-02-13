// @npUpgrade-inputFields-true
/*
 TODO: make sure newly added annotators wind up in hte episode.annotators list
 TODO: disentangle annotator_image_id from this, move it into parent template
 */

import { ILangForm, IModelSvc } from '../../../../interfaces';
import { IAnnotation } from '../../../../models';


const _sortAvailableAnnotators = (annotators: IAnnotators) => {
  const _filteredAnnotators = Object.keys(annotators).map(key => annotators[key]);
  const _nextAnnotator = _filteredAnnotators.pop();
  const _sortedAndFiltered = _filteredAnnotators.sort((a, b) => {
    if (a.key.toLowerCase() < b.key.toLowerCase()) {
      return -1;
    } else if (a.key.toLowerCase() > b.key.toLowerCase()) {
      return 1;
    } else {
      return 0;
    }
  });
  _sortedAndFiltered.push(_nextAnnotator);
  //return object built from sorted array
  return _sortedAndFiltered.reduce(
    (sortedObj, annotator) => {
      sortedObj[annotator.key] = annotator;
      return sortedObj;
    },
    {}
  );
};

export interface IAnnotator {
  name: ILangForm | '';
  annotation_image_id: string;
  key?: string;
  imageUrl?: string;
}

export interface IAnnotators {
  [key: string]: IAnnotator;
}


const TEMPLATE = `
<div style="position:relative;" ng-show="!$ctrl.hasAnnotator()">

	<input
	  class="annotatorChooser"
	  type="text"
	  ng-model="$ctrl.searchText"
	  ng-focus="$ctrl.showAutocomplete()"
	  ng-blur="$ctrl.hideAutocomplete()"
	  ng-change="$ctrl.handleAutocomplete()">

	<div class="autocompleteList animate transitionFade" ng-if="$ctrl.autoCompleting">
		<div class="autocompleteItem"
		  ng-repeat="annotator in $ctrl.filteredAnnotators"
		  ng-click="$ctrl.select(annotator)"
		  ng-class="{selected: ($index == $ctrl.preselectedItem)}"
		  style="white-space: nowrap">
			<img ng-src="{{annotator.imageUrl}}">
			<span ng-bind-html="(annotator.key | highlightSubstring: $ctrl.searchText) || '(New speaker)'"></span>
		</div>
	</div>
</div>
<div style="position:relative;" ng-show="$ctrl.hasAnnotator()">
	<np-input-i18n
	  on-field-change="$ctrl.onUpdate()"
	  field="$ctrl.item.annotator"
	  inputtype="input">
</np-input-i18n>
	<a style="position: absolute; top: 3px; right: 10px" ng-click="$ctrl.item.annotator={}">(x)</a>
</div>
`;

interface IAnnotatorAutocompleteBindings extends ng.IComponentController {
  annotators: any;
  item: IAnnotation;
  onUpdate: () => void;
}

class AnnotatorAutocompleteController implements IAnnotatorAutocompleteBindings {
  annotators: { [name: string]: IAnnotator };
  item: IAnnotation;
  onUpdate: () => void;
  //
  ngModelController: ng.INgModelController;
  autoCompleting: boolean;
  searchText: string;
  annotator: IAnnotator;
  filteredAnnotators: any;
  preselectedItem: number;
  static $inject = ['$element','$timeout', 'modelSvc', 'appState'];
  constructor(private $element, private $timeout: ng.ITimeoutService, private modelSvc: IModelSvc, private appState) {
    //
  }

  $onInit() {
    // look up the annotator images
    angular.forEach(this.annotators, (annotator) => {
      if (annotator.annotation_image_id) {
        annotator.imageUrl = this.modelSvc.assets[annotator.annotation_image_id].url;
      }
    });

    // the form value we'll ultimately want to return
    this.annotator = {
      name: this.item.annotator
    } as any;

    const hasAnnotator = this.item.annotator
      && this.item.annotator.name
      && this.annotators[this.item.annotator.name]
      && this.annotators[this.item.annotator.name].annotation_image_id;

    if (hasAnnotator) {
      this.annotator.imageUrl = this.modelSvc.assets[this.annotators[this.item.annotator.name].annotation_image_id].url;
    }

    this.filteredAnnotators =  _sortAvailableAnnotators(angular.copy(this.annotators));
    this.preselectedItem = -1;
  }

  $postLink() {

    this.$element.find('.annotatorChooser').bind('keydown', (event) => {
      switch (event.which) {
        case 40: // down arrow
          this.preselectedItem = (this.preselectedItem + 1) % Object.keys(this.filteredAnnotators).length;
          break;
        case 38: // up arrow
          this.preselectedItem = (this.preselectedItem - 1) % Object.keys(this.filteredAnnotators).length;
          break;
        case 13: // enter
          event.preventDefault();
          if (this.preselectedItem > -1) {
            this.selectByIndex(this.preselectedItem);
          }
          break;
        default:
      }
    });

  }

  hasAnnotator() {
    if (this.item && this.item.annotator) {
      return Object.keys(this.item.annotator).length > 0;
    }
  }

  selectByIndex(index: number) {
    if (index < 0) {
      return;
    }
    const names = Object.keys(this.filteredAnnotators).sort();
    this.select(this.filteredAnnotators[names[index]]);
  }

  select(annotator) {
    // console.log("Selected ", annotator);
    this.preselectedItem = -1;

    if (annotator.annotation_image_id) {
      this.item.annotation_image_id = annotator.annotation_image_id;
      this.item.asset = this.modelSvc.assets[annotator.annotation_image_id];
      this.annotator.imageUrl = this.item.asset.url;
    } else {
      // TODO allow adding new image
      delete this.annotator.imageUrl;
      delete this.item.asset;
    }

    this.ngModelController.$setViewValue(annotator.name); // passes annotator name back to item
    this.searchText = '';

    //TODO  allow upload to replace image
  }

  showAutocomplete() {
    const inputField = this.$element.find('.annotatorChooser')[0];
    inputField.setSelectionRange(0, inputField.value.length);
    this.autoCompleting = true;
  }

  handleAutocomplete() {
    this.annotator.name = '';
    if (this.searchText) {

      this.preselectedItem = -1;
      const newFilter = {};
      angular.forEach(this.annotators, (annotator) => {
        if (annotator.key.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1) {
          newFilter[annotator.key] = annotator;
        }
      });

      this.filteredAnnotators = newFilter;
      // if only one left, select it automatically
      if (Object.keys(this.filteredAnnotators).length === 1) {
        this.preselectedItem = 0;
      }
    } else {
      // empty searchText, show all autocomplete options
      this.filteredAnnotators = angular.copy(this.annotators);
      this.preselectedItem = -1;
    }
    this.onUpdate();
  }

  hideAutocomplete() {
    this.$timeout(
      () => {
        if (this.preselectedItem > -1) {
          this.selectByIndex(this.preselectedItem);
        } else {
          // doesn't match an existing name, so...
          if (this.searchText !== '') {
            this.addNewAnnotator();
          }
        }
        this.autoCompleting = false;
      },
      300
    );
  }

  addNewAnnotator() {
    const annotatorName = this.searchText; // TODO sanitize me!!!
    this.item.annotator = {} as any;
    this.item.annotator[this.appState.lang] = annotatorName;
    this.searchText = '';

    this.handleAutocomplete();

    // var newAnnotator = {
    // 	"name": {
    // 		"en": annotatorName // make sure we have something consistent to key against
    // 	},
    // 	"imageUrl": "",
    // 	"annotation_image_id": false
    // };
    // if (appState.lang !== 'en') {
    // 	newAnnotator.name[appState.lang] = annotatorName;
    // }
    // console.log(newAnnotator);

    // // make available in future transcript edits
    // // TODO shoudl this happen now? or wait until save?
    // scope.annotators[annotatorName] = angular.copy(newAnnotator);
    // console.log(scope.annotators);

    // scope.annotator = angular.copy(newAnnotator);
    // delete scope.annotator.imageUrl;

    // ngModelController.$setViewValue(newAnnotator);

  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class AnnotatorAutocomplete implements ng.IComponentOptions {
  require = {
    ngModelController: 'ngModel'
  };
  bindings: IComponentBindings = {
    annotators: '<',
    item: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = AnnotatorAutocompleteController;
  static Name: string = 'npAnnotatorAutocomplete'; // tslint:disable-line
}
