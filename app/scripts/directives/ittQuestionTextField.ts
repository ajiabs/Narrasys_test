/**
 * Created by githop on 6/30/16.
 */


export default function ittQuestionTextField() {
	return {
		restrict: 'EA',
		scope: true,
		template: `
			<div class="field">
				<div class="label">Question text</div>
				<div class="input" sxs-input-i18n="item.data._plugin.questiontext" x-inputtype="'textarea'"></div>
			</div>
			`
	};
}
