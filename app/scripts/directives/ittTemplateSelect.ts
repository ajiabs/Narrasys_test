/**
 * Created by githop on 6/30/16.
 */

export default function ittTemplateSelect() {
	return {
		restrict: 'EA',
		scope: true,
		template: `
			<div class="field">
				<div class="label">Template</div>
				<div class="input">
					<select ng-model="item.templateUrl" ng-change="selectService.onSelectChange(item)" ng-options="option.url as option.name for option in item.templateOpts"></select>
				</div>
			</div>
			`
	};
}
