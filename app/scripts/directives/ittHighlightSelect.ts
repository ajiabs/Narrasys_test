/**
 *
 * Created by githop on 6/30/16.
 */

export default function ittHighlightSelect() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Highlight<span ng-if="episode"> Style</spann></div>',
      '	<div class="input">',
      '		<select size="1" ng-model="itemForm.highlight">',
      '			<option ng-if="episode" value="">(Default)</option>',
      '			<option ng-if="item._type === \'Scene\'" value="">(Inherit from episode)</option>',
      '			<option ng-if="item._type !== \'Scene\' && !episode" value="">(Inherit from layout)</option>',
      '			<option value="None">No highlight</option>',
      '			<option value="Solid">Solid</option>',
      '			<option value="Border">Border</option>',
      '			<option value="Side">Side</option>',
      '			<option value="Bloom">Translucent</option>',
      '			<option value="Tilt">Tilt</option>',
      '		</select>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
