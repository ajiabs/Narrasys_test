// an angular.js wrapper for flot charting library -http://www.flotcharts.org/ but using flot.pie.js

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
				data: '@',
				chartLabel: '@'
			},
			template: ' <div id="chartContainer" aria-label="{{chartLabel}}"></div>',
			link: function (scope, element, attrs) {
				var chartContainer;
				var width = 500;
				var height = 500;

				var draw = _.after(2, function (el, d, o) {
					scope.chartLabel = createLabel(d);
					o.series.pie.label.formatter = function (label, series) {
						return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">' + label + '<br/>' + Math.round(series.data[0][1]) + '%</div>';
					};
					$.plot(el, d, o);

					el.show();
				});

				chartContainer = $("#chartContainer");

				if (scope.width)
					width = scope.width;
				if (scope.height)
					height = scope.height;
				chartContainer.css({
					width: width,
					height: height
				});
				attrs.$observe('data', function (value) {
					scope['data'] = JSON.parse(value);
					draw(chartContainer, scope.data, scope.options);
				});
				attrs.$observe('options', function (value) {
					scope['options'] = JSON.parse(value);
					draw(chartContainer, scope.data, scope.options);
				});
				var createLabel = function (data) {
					var labelText = "";
					for (var i = 0; i < data.length; i++) {
						labelText += Math.round(data[i].data) + "% of users choose \'" + data[i].label + "\'. ";
					}
					return labelText;
				};
			}
		};
	});

//div#chartContainer
//<itt-flotr2-chart title="" data="" options=""></itt-flotr2-chart>
