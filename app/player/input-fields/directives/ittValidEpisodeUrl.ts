// @npUpgrade-inputFields-true
import { capitalize } from '../../../shared/services/ittUtils';

/**
 * Created by githop on 2/21/17.
 */

export class ValidEpisodeUrl implements ng.IDirective {
  restrict: string = 'A';
  require = '?ngModel';
  scope = {
    onValidationNotice: '&'
  };
  static Name = 'npValidEpisodeUrl';
  static $inject = ['urlService', 'authSvc'];

  constructor(private urlService, private authSvc) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = (urlService, authSvc) => new ValidEpisodeUrl(urlService, authSvc);
    directiveInstance.$inject = ValidEpisodeUrl.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: ng.IAttributes, ngModel): void {
    const message = {
      showInfo: false,
      message: '',
      doInfo: false
    };

    let validatedFields = {
      kaltura: message,
      youtube: message,
      html5: message,
      error: message
    };

    const episodeUrl = (viewVal) => {
      validatedFields = {};
      if (ngModel.$isEmpty(viewVal)) {
        validatedFields['error'] = { showInfo: true, message: 'Field cannot be blank.' };
        return false;
      } else if (this.urlService.isVideoUrl(viewVal)) {
        const type = this.urlService.checkUrl(viewVal).type;

        if (type === 'html5' || type === 'wistia' && !this.authSvc.userHasRole('admin')) {
          validatedFields[type] = { showInfo: true, message: capitalize(type) + ' video currently not supported' };
          return false;
        }

        validatedFields[type] = { showInfo: true, message: capitalize(type) + ' detected', doInfo: true };
        return true;
      } else {
        validatedFields['error'] = { showInfo: true, message: viewVal + ' is not a valid episode URL' };
        return false;
      }
    };

    ngModel.$validators = {
      episodeUrl
    };

    scope.$watch(watchFields, handleUpdates, true);

    function watchFields() {
      return validatedFields;
    }

    function handleUpdates(newVal) {
      scope.onValidationNotice({ $notice: newVal });
    }
  }
}

ittValidEpisodeUrl.$inject = ['urlService', 'ittUtils', 'authSvc'];

export default function ittValidEpisodeUrl(urlService, ittUtils, authSvc) {
  return {
    require: '?ngModel',
    scope: {
      onValidationNotice: '&'
    },
    link: function (scope, elm, attr, ngModel) {
      var _capitalize = ittUtils.capitalize;
      var message = {
        showInfo: false,
        message: '',
        doInfo: false
      };

      var validatedFields = {
        kaltura: message,
        youtube: message,
        html5: message,
        error: message
      };

      ngModel.$validators = {
        episodeUrl: episodeUrl
      };

      scope.$watch(watchFields, handleUpdates, true);

      function watchFields() {
        return validatedFields;
      }

      function handleUpdates(newVal) {
        scope.onValidationNotice({ $notice: newVal });
      }

      function episodeUrl(viewVal) {
        validatedFields = {};
        if (ngModel.$isEmpty(viewVal)) {
          validatedFields['error'] = { showInfo: true, message: 'Field cannot be blank.' }; //jshint ignore:line
          return false;
        } else if (urlService.isVideoUrl(viewVal)) {
          var type = urlService.checkUrl(viewVal).type;

          if (type === 'html5' || type === 'wistia' && !authSvc.userHasRole('admin')) {
            validatedFields[type] = { showInfo: true, message: _capitalize(type) + ' video currently not supported' };
            return false;
          }

          validatedFields[type] = { showInfo: true, message: _capitalize(type) + ' detected', doInfo: true };
          return true;
        } else {
          validatedFields['error'] = { showInfo: true, message: viewVal + ' is not a valid episode URL' }; //jshint ignore:line
          return false;
        }
      }
    }
  };
}
