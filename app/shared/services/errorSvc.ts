// @npUpgrade-shared-false
/*
 to throw explicit errors:
 errorSvc.error({data: "This episode has not yet been published."});
 errorSvc.notify({data: "This hovercraft is full of Monty Python quotes."});

 throw() or other js errors also get sent here by $exceptionHandler (though we're ignoring them for now)
 */



errorSvc.$inject = ['$location'];

export default function errorSvc($location) {
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
}
