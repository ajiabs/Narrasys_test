// an angular.js wrapper for flotr2 charting library -  http://www.humblesoftware.com/flotr2/index#
angular.module('com.inthetelling.story')
	.directive('ittFlotr2Chart', function () {
		return {
			restrict: 'E',
			scope: {
				type: '@',
				height: '@',
				width: '@',
				title: '=title', //title is separate from options, but we may not want this as i'm not sure ALL charts have a title (or just one)
				options: '@',
				data: '@'
			},
			template: '<div id="chartContainer"></div>',
			link: function (scope, element, attrs) {

				var draw = _.after(2, function (el, d, o) {
					console.log('in after');
					if (d && o) {
						console.log("calling draw", d, o);
						Flotr.draw(el, d, o);
					}
				});
				var chartContainer;
				var width = 500;
				var height = 500;


				chartContainer = element.find("#chartContainer");

				if (scope.width)
					width = scope.width;
				if (scope.height)
					height = scope.height;
				chartContainer.css({
					width: width,
					height: height
				});
				attrs.$observe('data', function (value) {
					//TODO: only pass in data, options (e.g. not title, or type, or ..., which are in options anyway in flotr2). 
					// otherwise we have to observe too many properties and this will get 
					// even more ugly... and the encapsulation won't be worth it
					scope['data'] = JSON.parse(value);
//					scope.options[scope.type] = { //should be set on options, not as a directive scope binding
//						show: true
//					};
//					scope.options["title"] = scope.title; //ditto type. should be on options.
					draw(chartContainer[0], scope.data, scope.options);
				});
				attrs.$observe('options', function (value) {
					//TODO: only pass in data, options (e.g. not title, or type, or ..., which are in options anyway in flotr2). 
					// otherwise we have to observe too many properties and this will get 
					// even more ugly... and the encapsulation won't be worth it
					scope['options'] = JSON.parse(value);
//					scope.options[scope.type] = { //should be set on options, not as a directive scope binding
//						show: true
//					};
//					scope.options["title"] = scope.title; //ditto type. should be on options.
					draw(chartContainer[0], scope.data, scope.options);
				});

			}
		};
	});

//div#chartContainer
//<itt-flotr2-chart title="" data="" options=""></itt-flotr2-chart>
