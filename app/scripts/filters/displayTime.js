'use strict';

/*	
	Filters a collection of item models by their type property. Should be provided an map of allowed types. Types may be omitted.
	Usage example, filtering an items list to only links and images:
	<div ng-repeat="item in scene.items | types:{link: true, image: true}]"></div>
*/
angular.module('com.inthetelling.player')
.filter('displayTime', function () {
		console.log("displaytimefilter");
	return function(t) {
		console.log("displaytimefilter");
		return Math.floor(t/60) + ":" + ("0"+Math.floor(t)%60).slice(-2);
	};
});
