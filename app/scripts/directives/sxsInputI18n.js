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

				if (scope.inputtype === 'textarea') {
					// textAngular needs some extra magic for autofocus:
					scope.textangularname = "ta" + new Date().getUTCMilliseconds() + "y" + Math.random().toString(16);

					$timeout(function () { // wait for DOM
						if (attrs.autofocus !== undefined) {
							var editorScope = textAngularManager.retrieveEditor(scope.textangularname).scope;
							editorScope.displayElements.text.trigger('focus');
						}
					});

					scope.trim = function () {
						// Let's prevent users from throwing extra whitespace at beginning and end:
						var txt = scope.field[appState.lang];

						// yay regexp parsing of html my favorite thing to do

						txt = txt.replace(/<br\/>/g, '<br>'); // no xml-style tags

						// strip any <foo>(<br>*)</foo> from beginning and end:
						txt = txt.replace(/^\s*<([\w\d]*)>(<br>)*<\/\1>/, '');
						txt = txt.replace(/<([\w\d]*)>(<br>)*<\/\1>\s*$/, '');

						// strip all <p> and <br> from beginning, then replace the initial <p> if necessary
						txt = txt.replace(/^(\s|<(\/?p|br)>)*/, '');
						txt = txt.replace(/^([^<]*?)<\/p>/, '<p>$1</p>');

						// and strip all <p> and <br> from end, then replace the closing </p> if necessary
						txt = txt.replace(/(\s|<(\/?p|br)>)*$/, '');
						txt = txt.replace(/<p>([^<]*)$/, '<p>$1</p>');

						scope.field[appState.lang] = txt;

					};

					scope.sanitizePastedHtml = function (pasted) {
						console.log("PASTED ", pasted);
					};

				}
			}
		};
	});
