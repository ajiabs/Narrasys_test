import errorHtml from './error.html';

interface IErrorNoticeBindings extends ng.IComponentController {

}

class ErrorNoticeController implements IErrorNoticeBindings {
  static $inject = ['errorSvc', 'appState', 'authSvc'];

  constructor(private errorSvc, private appState, private authSvc) {
    //
  }

  get user() {
    return this.appState.user;
  }

  $onInit() {
    //
  }

  logout() {
    this.authSvc.logout();
  }

  dismiss(cur: any) {
    // this use of splice to remove items from the middle of the array in place works here
    // only because we're only removing a single item.  For multiple removes in one pass, will need to
    // scan backwards through the array
    for (let i = 0; i < this.errorSvc.errors.length; i += 1) {
      if (this.errorSvc.errors[i] === cur) {
        this.errorSvc.errors.splice(i, 1);
        i = this.errorSvc.errors.length; // break loop since we already removed our item
      }
    }
    for (let i = 0; i < this.errorSvc.notifications.length; i += 1) {
      if (this.errorSvc.notifications[i] === cur) {
        this.errorSvc.notifications.splice(i, 1);
        i = this.errorSvc.notifications.length;
      }
    }
  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ErrorNotice implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = errorHtml;
  controller = ErrorNoticeController;
  static Name: string = 'npErrorNotice'; // tslint:disable-line
}
