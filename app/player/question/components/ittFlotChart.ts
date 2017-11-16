// @npUpgrade-question-false
// an angular.js wrapper for flot charting library -http://www.flotcharts.org/ but using flot.pie.js
export default function ittFlotr2Chart() {
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
    template: '<div class="flotContainer"><div class="chartContainer" id="chartContainer" aria-label="{{chartLabel}}"></div><div class="legendContainer" id="legendContainer"></div></div>',
    link: function (scope, element, attrs) {

      var draw = function (el, d, o) {
        scope.chartLabel = createLabel(d);
        $.plot(el, d, o);
        el.show();
      };

      var chartContainer = $("#chartContainer");
      chartContainer.attr("id", "chartContainer" + uniqueId);
      var legendContainer = $("#legendContainer");
      legendContainer.attr("id", "legendContainer" + uniqueId++);

      var legendFormatterFn = function (label, series) {
        return Math.round(series.percent) + '% (' + series.data[0][1] + '): ' + label;
      };
      var labelFormatterFn = function (label, series) {
        return '<div style="padding: 3px; font-size: 80%">' + Math.round(series.percent) + '%</div>';
      };

      // defaults
      scope.chartOptions = {
        series: {
          pie: {
            show: true,
            label: {
              show: true,
              background: {
                opacity: 0.7
              },
              formatter: labelFormatterFn
            }
          }
        },
        legend: {
          show: true,
          labelFormatter: legendFormatterFn,
          //labelBoxBorderColor: color
          noColumns: 1,
          position: "sw", // or "nw" or "ne" or "sw"
          margin: 0, //number of pixels or [x margin, y margin]
          backgroundColor: null, // or color
          backgroundOpacity: 1, // number between 0 and 1
          sorted: 'descending', // null/false, true, "ascending", "descending", "reverse", or a comparator
          container: legendContainer // or jQuery object/DOM element/jQuery expression
        },

        grid: {
          hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
          content: "%y.0, %s", // show percentages, rounding to 2 decimal places
          shifts: {
            x: 20,
            y: 0
          },
          defaultTheme: false
        }
      };

      //  TODO merge scope.options into chartOptions
      // if (scope.options) {
      // 	 var newOptions = JSON.parse(scope.options);
      // }

      // watch width for both init and for resize:
      scope.$watch(function () {
        return chartContainer.width();
      }, function (w) {
        if (w > 0) {
          chartContainer.css({
            height: w
          });
          draw(chartContainer, JSON.parse(scope.data), scope.chartOptions);

          // Now that we have a height we can safely observe changes in the data:
          scope.observeData = attrs.$observe('data', function (value) {
            scope.data = JSON.parse(value);
            draw(chartContainer, scope.data, scope.chartOptions);
          });
          scope.$on('$destroy', scope.observeData);

          // Options never change (for now) so disabling the watcher
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
}
