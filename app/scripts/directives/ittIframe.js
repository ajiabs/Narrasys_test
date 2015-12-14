/**
 *
 * Created by githop on 12/8/15.
 */

'use strict';

export default function ittIframe() {
	return {
		restrict: 'E',
		scope: {
			src: '@',
			contenttype: '@'
		},
		replace: true,
		templateUrl: 'templates/iframe.html',
		link: function (scope) {
			// moved this all back out of the controller to avoid leaking $scope.sandbox across directives
			var _sandboxAttrs = 'allow-forms allow-same-origin allow-scripts';

			scope.watcher = scope.$watchGroup(['src', 'contenttype'], function () {
				if (!scope.src) {
					return;
				}

				if (scope.contenttype) {
					// Uploads will always have a content type; we can trust it:
					scope.sandbox = (scope.contenttype === 'text/html') ? _sandboxAttrs : undefined;
				} else {
					// no content type for links, so we have to fall back on string matching.
					// Ideally we'd only apply the sandbox to html files, but that's hard to match, so for now we'll
					// default to sandbox unless proven otherwise.
					scope.sandbox = _sandboxAttrs;

					// Remove it for PDFs (for now; probably we'll be growing this list later on)
					if (scope.src.match(/.pdf$/)) {
						delete scope.sandbox;
					}

					// Looks like we have some episodes where production used Links item types to point to asset uploads,
					// because upload templates  were broken (see TS-839). Would have been nice if they'd reported that
					// so we could fix it, but they didn't, so we'll clean up after them.

					// These won't have a file extension to match on, so we'll have to just
					// assume that anything in our upload space won't have a framebreaker.
					// URLs are either https://s3.amazonaws.com/ITT_Assets or https://s3.amazonaws.com/itt.user.uploads

					// TODO check to see if they always used ITT_Assets -- if so we can still protect against end-user uploads
					// of framebreaking files by using .match(/amazonaws.com\/ITT/) instead
					if (scope.src.match(/amazonaws.com\/itt/i)) {
						delete scope.sandbox;
					}
				}
			});

			scope.$on('$destroy', function () {
				scope.watcher();
			});
		}
	};
}

