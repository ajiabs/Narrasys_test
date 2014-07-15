'use strict';

/* 
to throw explicit errors:
		errorSvc.error({data: "This episode has not yet been published."});
*/

angular.module('com.inthetelling.player')
	.factory('errorSvc', function() {
		var svc = {};

		svc.errors = [];

		svc.init = function() {
			svc.errors = [];
		};
		svc.error = function(exception, cause) {
			if (exception && exception.data) {
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
