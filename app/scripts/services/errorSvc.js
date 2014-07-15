'use strict';

/* 
to throw explicit errors:
		errorSvc.error({data: "This episode has not yet been published."});
		errorSvc.notify({data: "This hovercraft is full of Monty Python quotes."});

*/

angular.module('com.inthetelling.player')
	.factory('errorSvc', function() {
		var svc = {};

		svc.errors = [];
		svc.notifications = [];

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
		svc.notify = function(note) {
			svc.notifications.push(note);
			console.log(svc);
		};
		return svc;
	});
