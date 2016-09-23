/**
 * Created by githop on 6/1/16.
 */

export default function ittModal() {
	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			modalClass: '@'
		},
		template: [
			'<div class="itt__modal"><div class="{{modalClass}}"><ng-transclude></ng-transclude></div></div>'
		].join(' ')
	};
}

