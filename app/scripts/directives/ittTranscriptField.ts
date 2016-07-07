/**
 * Created by githop on 6/30/16.
 */

export default function ittTranscriptField() {
	return {
		restrict: 'EA',
		scope: true,
		template: `
			<div class="field">
				<div class="label">Transcript [{{appState.lang}}]</div>
				<div class="input" sxs-input-i18n="item.annotation" x-inputtype="'textarea'" autofocus></div>
			</div>
			`
	};
}
