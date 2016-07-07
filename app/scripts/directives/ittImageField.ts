/**
 * Created by githop on 6/30/16.
 */
export default function ittImageField() {
	return {
		restrict: 'EA',
		scope: true,
		template: [
			'<div class="field" ng-show="selectService.showImageUpload()">',
			'	<div class="label">Image</div>',
			'	<div class="input" ng-include="\'templates/producer/upload-producer.html\'"></div>',
			'</div>'
		].join(' ')
	};
}
