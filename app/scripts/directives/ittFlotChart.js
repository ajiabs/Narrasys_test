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
			template: ' <div id="chartContainer" aria-label="{{chartLabel}}"></div><div id="pieHover"></div>',
			link: function (scope, element, attrs) {
				var chartContainer;
				var width = 500;
				var height = 500;
				var after = function (times, func) {
					return function () {
						if (--times < 1) {
							return func.apply(this, arguments);
						}
					};
				};
				var draw = after(2, function (el, d, o) {
					scope.chartLabel = createLabel(d);
					o.series.pie.label.formatter = function (label, series) {
						return '<div style="font-size:8pt;text-align:center;padding:2px;color:black;">' + label + '<br/>' + Math.round(series.percent) + '%' + ' (' + series.data[0][1] + ')</div>';
					};
					$.plot(el, d, o);

					el.show();
				});
				chartContainer = $("#chartContainer");
				
				var chartId = "chartContainer" + uniqueId++;
				chartContainer.attr("id", chartId);
				
				if (scope.width) {
					width = scope.width;
				}
				if (scope.height) {
					height = scope.height;
				}

				chartContainer.css({
					width: width,
					height: height
				});
				attrs.$observe('data', function (value) {
					scope.data = JSON.parse(value);
					draw(chartContainer, scope.data, scope.options);
				});
				attrs.$observe('options', function (value) {
					scope.options = JSON.parse(value);
					draw(chartContainer, scope.data, scope.options);
				});
				var addPercent = function (data) {
					var total = 0;
					for (var i = 0; i < data.length; i++) {
						total += data[i].data;		
					}
					for (var i = 0; i < data.length; i++) {
						data[i].percent = (data[i].data / total) * 100;
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

//div#chartContainer
//<itt-flotr2-chart title="" data="" options=""></itt-flotr2-chart>
