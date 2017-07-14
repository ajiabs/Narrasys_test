/**
 * Created by githop on 2/21/17.
 */

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
        scope.onValidationNotice({$notice: newVal});
      }

      function episodeUrl(viewVal) {
        validatedFields = {};
        if (ngModel.$isEmpty(viewVal)) {
          validatedFields['error'] = {showInfo: true, message: 'Field cannot be blank.'}; //jshint ignore:line
          return false;
        } else if (urlService.isVideoUrl(viewVal)) {
          var type = urlService.checkUrl(viewVal).type;

          if (type === 'html5' || type === 'wistia' && !authSvc.userHasRole('admin')) {
            validatedFields[type] = {showInfo: true, message: _capitalize(type) + ' video currently not supported'};
            return false;
          }

          validatedFields[type] = {showInfo: true, message: _capitalize(type) + ' detected', doInfo: true};
          return true;
        } else {
          validatedFields['error'] = {showInfo: true, message: viewVal + ' is not a valid episode URL'}; //jshint ignore:line
          return false;
        }
      }
    }
  };
}
