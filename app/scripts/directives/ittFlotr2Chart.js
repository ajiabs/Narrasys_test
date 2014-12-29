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
				var chartContainer;
				var width = 500;
				var height = 500;
				attrs.$observe('data', function (value) {
					scope['data'] = JSON.parse(value);
					console.log('dataaa-1', scope.data);

					chartContainer = element.find("#chartContainer");

					scope.options = {};
					scope.options[scope.type] = {
						show: true
					};
					scope.options["title"] = scope.title;
					if (scope.width)
						width = scope.width;
					if (scope.height)
						height = scope.height;
					chartContainer.css({
						width: width,
						height: height
					})
					Flotr.draw(chartContainer[0], scope.data, scope.options);

				});

			}
		};
	});

//div#chartContainer
//<itt-flotr2-chart title="" data="" options=""></itt-flotr2-chart>
