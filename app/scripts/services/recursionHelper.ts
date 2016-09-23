'use strict';
recursionHelper.$inject = ['$compile'];
export default function recursionHelper($compile) {
	return {
		// snarfed this from a SO answer.  Allows a directive to include itself without endless loops

		compile: function (element, link) {
			// Normalize the link parameter
			if (angular.isFunction(link)) {
				link = {
					post: link
				};
			}

			// Break the recursion loop by removing the contents
			var contents = element.contents().remove();
			var compiledContents;
			return {
				pre: (link && link.pre) ? link.pre : null,
				/**
				 * Compiles and re-adds the contents
				 */
				post: function (scope, element) {
					// Compile the contents
					if (!compiledContents) {
						compiledContents = $compile(contents);
					}
					// Re-add the compiled contents to the element
					compiledContents(scope, function (clone) {
						element.append(clone);
					});

					// Call the post-linking function, if any
					if (link && link.post) {
						link.post.apply(null, arguments);
					}
				}
			};
		}
	};
}