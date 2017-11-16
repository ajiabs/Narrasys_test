// @npUpgrade-inputFields-false
/**
 * Created by githop on 6/30/16.
 */

export default function ittTypographySelect() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Typography</div>',
      '	<div class="input">',
      '		<select size="1" ng-model="itemForm.typography">',
      '			<option value="">(Default)</option>',
      '			<option value="Sans">Sans</option>',
      '			<option value="Serif">Serif</option>',
      '			<option value="Book">Book</option>',
      '			<option value="Swiss">Swiss</option>',
      '		</select>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
