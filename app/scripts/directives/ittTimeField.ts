/**
 * Created by githop on 6/30/16.
 */

export default function ittTimeField() {
	return {
		restrict: 'EA',
		scope: true,
		template: `
			<div class="field">
				<div class="label">Time</div>
				<div class="input">
					<span sxs-input-time="item" x-input-field="start_time"></span>
					<span ng-if="!(item.stop || item._type === 'Scene' || item._type === 'Chapter')">
						<span class="label"> &nbsp; &nbsp; &nbsp; End</span>
						<span sxs-input-time="item" x-input-field="end_time"></span>
					</span>
				</div>
			</div>
			`
	};
}
