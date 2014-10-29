'use strict';

/* 
to throw explicit errors:
		errorSvc.error({data: "This episode has not yet been published."});
		errorSvc.notify({data: "This hovercraft is full of Monty Python quotes."});

throw() or other js errors also get sent here by $exceptionHandler (though we're ignoring them for now)
*/

angular.module('com.inthetelling.story')
	.factory('errorSvc', function () {
		var svc = {};

		// TODO make the field names less ridiculously inconsistent.  

		svc.init = function () {
			svc.errors = [];
			svc.notifications = [];
		};
		svc.init();

		svc.error = function (exception, cause) {
			if (exception && exception.status === 401) {
				// "unauthorized" errors will clear login state for now.
				// TODO in future there may be cases where this isn't desirable (i.e. when we support more roles,
				// it may make sense to keep an existing role in place even if the user attempts to do something they're not allowed to?)
				console.warn("401 detected");
			}
			if (exception && exception.data) {
				// API errors go here:
				svc.errors.push({
					"exception": exception,
					"cause": exception.data.error
						//"stack": exception.stack.toString()
				});
			} else {
				// generic thrown javascript error.  TODO show these too, but only in dev environment (they're often not meaningful)
				console.warn("ErrorSvc caught error: ", exception, cause);
			}
		};

		svc.notify = function (note) {
			svc.notifications.push({
				'text': note
			});
		};

		return svc;
	});
