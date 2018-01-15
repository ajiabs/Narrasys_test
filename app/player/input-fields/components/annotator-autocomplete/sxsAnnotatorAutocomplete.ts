// @npUpgrade-inputFields-false
/*
 TODO: make sure newly added annotators wind up in hte episode.annotators list
 TODO: disentangle annotator_image_id from this, move it into parent template
 */

import { ILangForm, IModelSvc } from '../../../../interfaces';
import annotatorAutocompleteHtml from './annotator-autocomplete.html';
import { IAnnotation, IEvent } from '../../../../models';


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
	<div sxs-input-i18n="$ctrl.item.annotator" x-inputtype="'input'"></div>
	<a style="position: absolute; top: 3px; right: 10px" ng-click="$ctrl.item.annotator={}">(x)</a>
</div>
`;

interface IAnnotatorAutocompleteBindings extends ng.IComponentController {
  annotators: any;
  item: IAnnotation;
}

class AnnotatorAutocompleteController implements IAnnotatorAutocompleteBindings {
  annotators: { [name: string]: IAnnotator };
  item: IAnnotation;
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

  $onChanges(changes: { item: ng.IChangesObject }) {

    if (changes && changes.item && changes.item.currentValue != null) {
      // look up the annotator images
      console.log('fucking has a value', this.item);
      angular.forEach(this.annotators, (annotator) => {
        if (annotator.annotation_image_id) {
          annotator.imageUrl = this.modelSvc.assets[annotator.annotation_image_id].url;
        }
      });

      // the form value we'll ultimately want to return
      console.log('what gives mate?', this.item);
      this.annotator = {
        name: this.item.annotator
      } as any;

      if (this.annotators[this.item.annotator.name] && this.annotators[this.item.annotator.name].annotation_image_id) {
        this.annotator.imageUrl = this.modelSvc.assets[this.annotators[this.item.annotator.name].annotation_image_id].url;
      }

      this.filteredAnnotators =  _sortAvailableAnnotators(angular.copy(this.annotators));
      this.preselectedItem = -1;
    }
  }

  $onInit() {

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
    this.item.annotator = {};
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
    ngModel: 'ngModel'
  };
  bindings: IComponentBindings = {
    annotators: '<',
    item: '<'
  };
  template: string = TEMPLATE;
  controller = AnnotatorAutocompleteController;
  static Name: string = 'npAnnotatorAutocomplete'; // tslint:disable-line
}


sxsAnnotatorAutocomplete.$inject = ['$timeout', 'modelSvc', 'appState'];

export default function sxsAnnotatorAutocomplete($timeout, modelSvc, appState) {
  return {
    require: 'ngModel',
    template: annotatorAutocompleteHtml,
    scope: {
      annotators: '=sxsAnnotatorAutocomplete',
      item: '=item'
    },
    link: function (scope, element, attrs, ngModelController) {

      // scope.appState = appState;
      // scope.hasAnnotator = function () {
      //   if (scope.item.annotator) {
      //     return Object.keys(scope.item.annotator).length > 0;
      //   }
      // };

      // // look up the annotator images
      // angular.forEach(scope.annotators, function (annotator) {
      //   if (annotator.annotation_image_id) {
      //     annotator.imageUrl = modelSvc.assets[annotator.annotation_image_id].url;
      //   }
      // });

      // the form value we'll ultimately want to return
      // scope.annotator = {
      //   name: scope.item.annotator
      // };

      // if (scope.annotators[scope.item.annotator] && scope.annotators[scope.item.annotator].annotation_image_id) {
      //   scope.annotator.imageUrl = modelSvc.assets[scope.annotators[scope.item.annotator].annotation_image_id].url;
      // }
      //
      // scope.filteredAnnotators =  _sortAvailableAnnotators(angular.copy(scope.annotators));
      // scope.preselectedItem = -1;

      // function _sortAvailableAnnotators(annotators: IAnnotators) {
      //   let _filteredAnnotators = Object.keys(annotators).map(key => annotators[key]);
      //   let _nextAnnotator = _filteredAnnotators.pop();
      //   let _sortedAndFiltered = _filteredAnnotators.sort((a, b) => {
      //     if (a.key.toLowerCase() < b.key.toLowerCase()) {
      //       return -1;
      //     } else if (a.key.toLowerCase() > b.key.toLowerCase()) {
      //       return 1;
      //     } else {
      //       return 0;
      //     }
      //   });
      //   _sortedAndFiltered.push(_nextAnnotator);
      //   //return object built from sorted array
      //   return _sortedAndFiltered.reduce((sortedObj, annotator) => {
      //     sortedObj[annotator.key] = annotator;
      //     return sortedObj;
      //   }, {});
      // }



      // element.find('.annotatorChooser').bind("keydown", function (event) {
      //   switch (event.which) {
      //     case 40: // down arrow
      //       scope.preselectedItem = (scope.preselectedItem + 1) % Object.keys(scope.filteredAnnotators).length;
      //       break;
      //     case 38: // up arrow
      //       scope.preselectedItem = (scope.preselectedItem - 1) % Object.keys(scope.filteredAnnotators).length;
      //       break;
      //     case 13: // enter
      //       event.preventDefault();
      //       if (scope.preselectedItem > -1) {
      //         scope.selectByIndex(scope.preselectedItem);
      //       }
      //       break;
      //     default:
      //   }
      // });

      // TODO destroy langWatcher when unlinking

      // scope.handleAutocomplete = function () {
      //   scope.annotator.name = '';
      //   if (scope.searchText) {
      //
      //     scope.preselectedItem = -1;
      //     var newFilter = {};
      //     angular.forEach(scope.annotators, function (annotator) {
      //       // console.log(annotator.key.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1, annotator.key.toLowerCase(), scope.searchText.toLowerCase());
      //       if (annotator.key.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1) {
      //         newFilter[annotator.key] = annotator;
      //       }
      //     });
      //
      //     scope.filteredAnnotators = newFilter;
      //     // if only one left, select it automatically
      //     if (Object.keys(scope.filteredAnnotators).length === 1) {
      //       scope.preselectedItem = 0;
      //     }
      //   } else {
      //     // empty searchText, show all autocomplete options
      //     scope.filteredAnnotators = angular.copy(scope.annotators);
      //     scope.preselectedItem = -1;
      //   }
      //
      // };

      // scope.selectByIndex = function (index) {
      //   if (index < 0) {
      //     return;
      //   }
      //   var names = Object.keys(scope.filteredAnnotators).sort();
      //   scope.select(scope.filteredAnnotators[names[index]]);
      // };

      // scope.select = function (annotator) {
      //   // console.log("Selected ", annotator);
      //   scope.preselectedItem = -1;
      //
      //   if (annotator.annotation_image_id) {
      //     scope.item.annotation_image_id = annotator.annotation_image_id;
      //     scope.item.asset = modelSvc.assets[annotator.annotation_image_id];
      //     scope.annotator.imageUrl = scope.item.asset.url;
      //   } else {
      //     // TODO allow adding new image
      //     delete scope.annotator.imageUrl;
      //     delete scope.item.asset;
      //   }
      //
      //   ngModelController.$setViewValue(annotator.name); // passes annotator name back to item
      //   scope.searchText = '';
      //
      //   //TODO  allow upload to replace image
      // };

      // scope.autoCompleting = false;
      // scope.showAutocomplete = function () {
      //   var inputField = element.find('.annotatorChooser')[0];
      //   inputField.setSelectionRange(0, inputField.value.length);
      //   scope.autoCompleting = true;
      // };

      scope.hideAutocomplete = function () {
        $timeout(function () {
          if (scope.preselectedItem > -1) {
            scope.selectByIndex(scope.preselectedItem);
          } else {
            // doesn't match an existing name, so...
            if (scope.searchText !== '') {
              scope.addNewAnnotator();
            }
          }
          scope.autoCompleting = false;
        }, 300);
      };

      scope.addNewAnnotator = function () {
        var annotatorName = scope.searchText; // TODO sanitize me!!!
        scope.item.annotator = {};
        scope.item.annotator[appState.lang] = annotatorName;
        scope.searchText = "";

        scope.handleAutocomplete();

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

      };

      scope.uploadAnnotatorImage = function () {
        window.alert("TODO");
        // For replacing existing annotator thumbnails, do we need to go through every transcript node with that speaker and replace its annotator ID? TODO check with Bill how he ahndles that in old authoring

      };
    }
  };
}
