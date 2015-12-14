'use strict';

export default function sxsInputI18n(appState, $timeout, textAngularManager) {
	'ngInject';
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
					if (!txt) {
						return;
					}
					console.log("BEFORE", txt);

					// yay regexp parsing of html my favorite thing to do
					txt = txt.replace(/<br\/>/g, '<br>'); // no xml-style tags

					// Replacing lots of complicated regexps with this brute force (we don't want user-input spans or divs anyway.)
					txt = txt.replace(/<div>/g, '<br>');
					txt = txt.replace(/<\/?(span|div)>/g, '');
					txt = txt.replace(/(<br>)*$/, ''); // kill extra linebreaks at end of entered text

					console.log("AFTER", txt);
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
}
