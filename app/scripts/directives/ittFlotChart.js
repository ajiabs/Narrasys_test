'use strict';

// an angular.js wrapper for flot charting library -http://www.flotcharts.org/ but using flot.pie.js
angular.module('com.inthetelling.story')
	.directive('ittFlotr2Chart', function () {
		var uniqueId = 1;
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
			template: ' <div class="chartContainer" id="chartContainer" aria-label="{{chartLabel}}"></div>',
			link: function (scope, element, attrs) {
				var chartContainer;

				var draw = function (el, d, o) {
					d = JSON.parse(d);
					o = JSON.parse(o);
					scope.chartLabel = createLabel(d);
					o.series.pie.label.formatter = function (label, series) {
						return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">' + label + '<br/>' + Math.round(series.percent) + '%' + ' (' + series.data[0][1] + ')</div>';
					};
					$.plot(el, d, o);
					el.show();
				};

				chartContainer = $("#chartContainer");
				var chartId = "chartContainer" + uniqueId++;
				chartContainer.attr("id", chartId);

				scope.$watch(function () {
					return chartContainer.width();
				}, function (w) {
					if (w > 0) {
						chartContainer.css({
							height: w
						});

						draw(chartContainer, scope.data, scope.options);

						// Now that we have a height we can safely observe changes in the data:
						attrs.$observe('data', function (value) {
							scope.data = value;
							draw(chartContainer, scope.data, scope.options);
						});

						// Options never change (for now) so disabling the watcher (for now)
						// attrs.$observe('options', function (value) {
						// 	scope.options = value;
						// 	draw(chartContainer, scope.data, scope.options);
						// });

					}
				});

				var addPercent = function (data) {
					var total = 0;
					for (var i = 0; i < data.length; i++) {
						total += data[i].data;
					}
					for (var y = 0; y < data.length; y++) {
						data[y].percent = (data[y].data / total) * 100;
					}
					return data;
				};
				var createLabel = function (data) {
					var labelText = "";
					data = addPercent(data);
					for (var i = 0; i < data.length; i++) {
						labelText += Math.round(data[i].percent) + "% of users totaling " + data[i].data + " choose \'" + data[i].label + "\'. ";
					}
					return labelText;
				};
			}
		};
	});
