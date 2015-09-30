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
						var txt = scope.field[appState.lang] || '';

						// yay regexp parsing of html my favorite thing to do
						txt = txt.replace(/<br\/>/g, '<br>'); // no xml-style tags

						// we're using ta-default-wrap="span"; without that tA would wrap single-line elements in <p><br>...</p>
						// span still puts in too much extraneous html, so we do a bit of cleanup.
						// This could obvs be made more efficient.
						var startSpan = /^(\s|<span>)/;
						var endSpan = /(\s|<\/span>)*$/;
						if (txt.match(startSpan)) {
							while (txt.match(startSpan)) {
								txt = txt.replace(startSpan, '');
								txt = txt.replace(endSpan, '');
							}
						}

						// This was for the default <p><br>...</p> behavior:
						// var numberOfPs = txt.match(/<p>/);
						// console.log("Matches:", numberOfPs);
						// if (numberOfPs && numberOfPs.length === 1) {
						// 	txt = txt.replace(/^(\s|<(\/?p|br)>)*/, '');
						// 	txt = txt.replace(/(\s|<(\/?p|br)>)*$/, '');
						// }

						scope.field[appState.lang] = txt;
					};

					scope.sanitizePastedHtml = function (pasted) {
						// Strip out all markup from pasted content (to keep those addicted to MS Word from shooting themselves in the foot)
						var frag = document.createElement("div");
						frag.innerHTML = pasted;
						return frag.textContent;
					};

				}
			}
		};
	});
