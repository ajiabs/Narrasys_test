// @npUpgrade-inputFields-false
/**
 * Created by githop on 6/30/16.
 */


export default function ittTransitionSelect() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Transition</div>',
      '	<div class="input">',
      '		<select size="1" ng-model="itemForm.transition">',
      '			<option ng-if="episode" value="">(Default)</option>',
      '			<option ng-if="item._type === \'Scene\'" value="">(Inherit from episode)</option>',
      '			<option ng-if="item._type !== \'Scene\' && !episode" value="">(Inherit from layout)</option>',
      '			<option value="None">No transition</option>',
      '			<option value="Fade">Fade</option>',
      '			<option value="SlideL">Slide left</option>',
      '			<option value="SlideR">Slide right</option>',
      // '			<option value="ExpandW">Expand</option>',
      '			<option value="Pop">Pop</option>',
      '		</select>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
