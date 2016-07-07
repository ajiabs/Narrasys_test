/**
 * Created by githop on 6/30/16.
 */
export default function ittSpeakerField() {
	return {
		restrict: 'EA',
		scope: true,
		template: `
			<div class="field">
				<div class="label">Speaker [{{appState.lang}}]</div>
				<div class="input">
					<div sxs-annotator-autocomplete="annotators" item="item" ng-model="item.annotator"></div>
				</div>
			</div>
		`
	};
}
