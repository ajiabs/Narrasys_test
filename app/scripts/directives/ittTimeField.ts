/**
 * Created by githop on 6/30/16.
 */

export default function ittTimeField() {
  return {
    restrict: 'EA',
    scope: true,
    template: [
      '<div class="field" ng-if="!(item._type===\'Scene\' && item.start_time <= 0.1)">',
      '	<div class="label">Start</div>',
      '	<div class="input">',
      '  <itt-validation-tip ng-if="ittItemForm.time.$invalid" text="{{item.validationMessage}}"></itt-validation-tip>',
      '		<span sxs-input-time="item" x-input-field="start_time"></span>',
      '		<span ng-if="!(item.stop || item._type === \'Scene\' || item._type === \'Chapter\')">',
      '			<span class="label"> &nbsp; &nbsp; &nbsp; End</span>',
      '			<span sxs-input-time="item" x-input-field="end_time"></span>',
      '		</span>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
