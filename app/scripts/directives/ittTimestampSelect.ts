/**
 * Created by githop on 6/30/16.
 */
export default function ittTimestampSelect() {
	return {
		restrict: 'EA',
		scope: true,
		template: `	
			<div class="field">
				<div class="label">Timestamp</div>
				<div class="input">
					<select size="1" ng-model="itemForm.timestamp">
						<option value="">(Default)</option>
						<option value="None">No timestamp</option>
						<option value="Inline">Inline timestamp</option>
					</select>
				</div>
			</div>
			`
	};
}
