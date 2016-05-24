'use strict';

/*
to throw explicit errors:
		errorSvc.error({data: "This episode has not yet been published."});
		errorSvc.notify({data: "This hovercraft is full of Monty Python quotes."});

throw() or other js errors also get sent here by $exceptionHandler (though we're ignoring them for now)
*/

angular.module('com.inthetelling.story')
	.factory('errorSvc', function ($location, $rootScope) {
		var svc = {};

		// TODO This is a mess.  make the field names less ridiculously inconsistent.

		svc.init = function () {
			svc.errors = [];
			svc.notifications = [];
		};
		svc.init();

		svc.error = function (exception, cause) {
			if (exception && (exception.status === 401 || exception.status === 403)) {
				// "unauthorized" errors will clear login state for now.
				// TODO in future there may be cases where this isn't desirable (i.e. when we support more roles,
				// it may make sense to keep an existing role in place even if the user attempts to do something they're not allowed to?)
				console.warn(exception.status, " detected");

				//guest accessible narratives - refresh session
				var _sessionTimeout = exception.status === 401 && exception.data.error === 'Authentication expired. Please log in again.' && !exception.config.url.match(/show_user/);
				if (_sessionTimeout) {
					$rootScope.$broadcast('error:sessionTimeout');
					//return out of this fn in order to avoid
					//pushing current exception into errors array
					//where it would trigger the error dialog to pop up.
					return;
				}

				var _userRoleAccessError = exception.status === 401 && exception.data.error === "This action requires logging in or you do not have sufficient rights.";

				if (_userRoleAccessError) {
					$rootScope.$broadcast('error:sessionTimeout');
					return;
				}

				var _eventReportAccessFailure = exception.config.url.match(/(episode_user_metrics|event_user_actions)/);
				if (_eventReportAccessFailure) {
					//this is prevent the error dialog from showing when failing to post an event report with BOTH
					//episode_user_metrics and event_user_actions.

					//The analyticsSvc will make 2 post requests to 2 endpoints in parallel when sending multiple reports.
					//if the first request is rejected, the server will reset the the access token and respond
					//with a 401.
					//the second post request will also respond with 401, but not due to session timeout, as the prior request resulted in
					//their access token being reset.

					//the first 401 response gets intercepted by the httpInterceptor in app.js and sends the exception to the errorSvc
					//where it will trigger the _sessionTimeout conditional above, and begin to re-authenticate the user via nonce.
					//the second 401 response is handled via the above _eventReportAccessFailure conditional.
					//here we return out of the error service to avoid popping up the error dialog.
					//the analytics service will save failed reports and eventually post them when credentials are restored
					//which happens in the _sessionTimeout conditional above.
					return;
				}


				// hacky special case for login page
				if ($location.path() === '/') {
					exception = undefined;
				}
			}
			if (exception && exception.data) {
				// API errors go here.

				if (typeof exception.data === "string") {
					// hide ruby stack trace:
					exception.data = exception.data.replace(/\n/g, '').replace(/==/g, '').replace(/-----.*/g, '');
					svc.errors.push({
						"exception": exception
					});
				} else {
					svc.errors.push({
						"exception": exception
					});
				}
			} else if (exception && exception.session) {
				svc.errors.push({exception: exception});

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
