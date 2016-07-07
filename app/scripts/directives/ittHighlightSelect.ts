/**
 *
 * Created by githop on 6/30/16.
 */

export default function ittHighlightSelect() {
	return {
		restrict: 'EA',
		scope: true,
		template: [
			'<div class="field">',
			'	<div class="label">Highlight</div>',
			'	<div class="input">',
			'		<select size="1" ng-model="itemForm.highlight">',
			'			<option value="">(Default)</option>',
			'			<option value="Solid">Solid</option>',
			'			<option value="Border">Border</option>',
			'			<option value="Side">Side</option>',
			'			<option value="Bloom">Bloom</option>',
			'			<option value="Highlighter">Highlighter</option>',
			'			<option value="Tilt">Tilt</option>',
			'		</select>',
			'	</div>',
			'</div>'
		].join(' ')
	};
}

