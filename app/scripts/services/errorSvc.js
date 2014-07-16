'use strict';

/* 
to throw explicit errors:
		errorSvc.error({data: "This episode has not yet been published."});
		errorSvc.notify({data: "This hovercraft is full of Monty Python quotes."});

*/

angular.module('com.inthetelling.player')
	.factory('errorSvc', function () {
		var svc = {};

		// TODO make the field names less ridiculously inconsistent.  

		svc.init = function () {
			svc.errors = [];
			svc.notifications = [];
		};
		svc.init();

		svc.error = function (exception, cause) {
			if (exception && exception.data) {
				// API errors go here:
				svc.errors.push({
					"exception": exception,
					"cause": exception.data.error
						//"stack": exception.stack.toString()
				});
			} else {
				// generic thrown javascript error.  TODO show these too, but only in dev environment (they're often not meaningful)
				console.log(exception);
			}
		};

		svc.notify = function (note) {
			svc.notifications.push({
				'text': note
			});
		};

		return svc;
	});
