/**
 * Created by githop on 6/30/16.
 */

export default function ittUrlField() {
	return {
		restrict: 'EA',
		scope: true,
		template: `
			<div class="field">
				<div class="label">URL</div>
				<div class="input">
					<form class="doValidate" name="urlForm">
						<input type="text" itt-valid-item-url item="item" name="itemUrl" ng-model-options="{ updateOn: 'blur' }" ng-model="item.url"/>
					</form>
				</div>
			</div>
			`
	};
}
