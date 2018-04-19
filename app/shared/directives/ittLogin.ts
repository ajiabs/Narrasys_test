// @npUpgrade-shared-false
/*
 No UI for this directive. This originally showed a login form but that led to a flash-of-content when authenticating via lti

 */

import { config } from '../../config';

ittLogin.$inject = ['$location', '$routeParams', 'authSvc', 'appState', 'errorSvc'];

export default function ittLogin($location, $routeParams, authSvc, appState, errorSvc) {
  return {
    restrict: 'A',
    replace: false,

    link: function (scope) {

      scope.userHasRole = authSvc.userHasRole;

      scope.appState = appState;
      scope.loginForm = {
        auth_key: '',
        password: ''
      };

      scope.apiDataBaseUrl = config.apiDataBaseUrl;

      let logout = $location.$$url.includes("/?logout=1") ? true : false;
      if( !logout ) {
        authSvc.authenticate().then(function () {
          errorSvc.init();
          if ($routeParams.key) {
            // (Probably unnecessary here, but testing to see if this fixes the unintended redirect from /#/auth)
            $location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
          }
          if ($routeParams.episode) {
            var epId = $routeParams.episode;
            $location.search('episode', null);
            $location.search('nonce', null);
            $location.path('/episode/' + epId);
          } else if ($routeParams.narrative) {
            var narrId = $routeParams.narrative;
            $location.search('narrative', null);
            $location.search('nonce', null);
            if ($routeParams.timeline) {
              var timelineId = $routeParams.timeline;
              $location.search('timeline', null);
              $location.path('/story/' + narrId + '/' + timelineId);
            } else {
              $location.path('/story/' + narrId);
            }

          } else if (Object.keys($routeParams).length === 0) {
           $location.path('/account');
          }
        },
        function () {
          console.log("Login failed...");
        });

      }

      // for admin logins only, for now. In future maybe oauth-based login will route through here too
      scope.adminLogin = function () {
        authSvc.adminLogin(scope.loginForm.auth_key, scope.loginForm.password)
          .then(function () {
            $location.path('/projects');
          })
          .catch(function (data) {
            console.warn("FAILED ADMIN LOGIN", data);
            scope.badlogin = true;
          });
      };

      scope.logout = function () {
        authSvc.logout();
      };

    }
  };

}
