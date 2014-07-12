'use strict';

/* 
to throw explicit errors:
		errorSvc.error({exception data structure:"TO BE DEFINED"},"Cause: ALL MESSED UP");
*/

angular.module('com.inthetelling.player')
	.factory('errorSvc', function() {
		var svc = {};

		svc.errors = [];

		svc.error = function(exception, cause) {
			if (exception && exception.data && exception.data.error) {
				// API errors go here:
				svc.errors.push({
					"exception": exception,
					"cause": exception.data.error
					//"stack": exception.stack.toString()
				});
			} else {
				// generic error.  TODO show these too, but only in dev environment
				console.log(exception);
			}
		};
		return svc;
	});
