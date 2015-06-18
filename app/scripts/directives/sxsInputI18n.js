'use strict';

angular.module('com.inthetelling.story')
	.directive('sxsInputI18n', function (appState, $timeout, textAngularManager) {
		return {
			templateUrl: 'templates/producer/inputi18n.html',
			scope: {
				field: "=sxsInputI18n",
				inputtype: "=inputtype"
			},
			link: function (scope, el, attrs) {
				if (!scope.field) {
					// need to init the object if it's empty
					scope.field = {
						en: ""
					};
				}
				scope.appState = appState;
				console.log(attrs, textAngularManager);
				if (scope.inputtype === 'textarea') {
					// textAngular needs some extra magic for autofocus:
					scope.textangularname = "ta" + new Date().getUTCMilliseconds() + "y" + Math.random().toString(16);

					$timeout(function () { // wait for DOM
						if (attrs.autofocus !== undefined) {
							var editorScope = textAngularManager.retrieveEditor(scope.textangularname).scope;
							editorScope.displayElements.text.trigger('focus');
						}
					});
				}
			}
		};
	});
