// @npUpgrade-shared-false
/*
 to throw explicit errors:
 errorSvc.error({data: "This episode has not yet been published."});
 errorSvc.notify({data: "This hovercraft is full of Monty Python quotes."});

 throw() or other js errors also get sent here by $exceptionHandler (though we're ignoring them for now)
 */

 // ********************************
 // 
 // updated 2/7/18 
 // by Joseph B. and Eddie D. 
 // from Curve10
 // converted to interface->class structure
 // NOTE: had to adjust ../shared.module.ts
 //       to attach as a service and not a factory
 //
 // ***********************************************



export interface IErrorServices {
  error(exception:{}, cause:string):{};
  notify(note:string):{};
  init(): void;
}

export class ErrorSvc implements IErrorServices {

  static Name = 'errorSvc'; // tslint:disable-line
  errors = [];
  notifications = [];

 

  static $inject = ['$location'];
  
  constructor( private $location: ng.ILocationService) {
  }

   // svc() {
  //   svc.errors = [];
  //   svc.notifications = [];
  // };
  // svc.init();

  init(): void {
    // added 2/18... resets errors and notifications to empty
    this.errors = [];
    this. notifications = [];

  }

  error(exception, cause):{} {
    if (exception && (exception.status === 401 || exception.status === 403)) {
      // "unauthorized" errors will clear login state for now.
      // TODO in future there may be cases where this isn't desirable (i.e. when we support more roles,
      // it may make sense to keep an existing role in place even if the user attempts to do something they're not allowed to?)
      console.warn(exception.status, " detected");

      // hacky special case for login page
      if (this.$location.path() === '/') {
        exception = undefined;
      }
    }
    if (exception && exception.data) {
      // API errors go here.

      if (typeof exception.data === "string") {
        // hide ruby stack trace:
        exception.data = exception.data.replace(/\n/g, '').replace(/==/g, '').replace(/-----.*/g, '');
        this.errors.push({
          "exception": exception
        });
      } else {
        this.errors.push({
          "exception": exception
        });
      }
    } else {
      // generic thrown javascript error.  TODO show these too, but only in dev environment (they're often not meaningful)
      console.log("ErrorSvc caught error: ", exception, cause);
    }
    return this.errors;
  }

  notify(note):{} {
    this.notifications.push({
      'text': note
    });
    return this.notifications;
  }
}
