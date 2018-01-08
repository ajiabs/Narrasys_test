// @npUpgrade-inputFields-false
/**
 * Created by githop on 8/23/16.
 */

//impure, currently depends on inheriting scope for 'langform'
export default function ittLanguageFlags() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Languages</div>',
      '	<div class="input">',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.en">English',
      '	</label>',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.es">Spanish',
      '	</label>',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.zh">Chinese',
      '	</label>',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.pt">Portuguese',
      '	</label>',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.fr">French',
      '	</label>',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.de">German',
      '	</label>',
      '	<label>',
      '		<input type="checkbox" ng-model="langForm.it">Italian',
      '	</label>',
      '	</div>',
      '</div>'
    ].join('\n')
  };
}

