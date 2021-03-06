// Declare the top level application module and its dependencies
/**
 * @ngdoc interface
 * @name iTT
 * @description
 * The default namespace / angular module which houses the rest of the application code.
 * Officially titled as 'com.inthetelling.story' but iTT seems a little less verbose
 * @requires ngRoute
 * @requires ngAnimate
 * @requires ngSanitize
 * @requires textAngular
 */

import './styles/app.scss';
import './styles/vendor.scss';
import '../plugin/plugins';
import 'core-js/client/shim';
import 'angular-ui-tree';

import 'angular-socialshare';
// modules

import './shared/shared.module';
import './projects/projects.module';
import './stories/stories.module';
import './player/player.module';

angular.module('np.client', [
  'ngRoute',
  'ngAnimate',
  'ui.tree',
  '720kb.socialshare',
  'np.shared',
  'np.projects',
  'np.stories',
  'np.player'
])
  .constant('PLAYERSTATES', {
    '-1': 'unstarted',
    '0': 'ended',
    '1': 'playing',
    '2': 'paused',
    '3': 'buffering',
    '5': 'video cued',
    '4': 'quality changed',
    '6': 'player ready'
  })
  .constant('PLAYERSTATES_WORD', {
    'unstarted': '-1',
    'ended': '0',
    'playing': '1',
    'paused': '2',
    'buffering': '3',
    'quality changed': '4',
    'video cued': '5',
    'player ready': '6'
  })
  // Configure routing
  .config(['$routeProvider', routerConfig])
  // Configure x-domain resource whitelist (TODO: do we actually need this?)
  .config(['$sceDelegateProvider', xDomainConfig])
  // Configure http headers and intercept http errors
  .config(['$httpProvider', authInterceptorConfig])
  //config for debug info disable
  .config(['$compileProvider', debugInfoConfig])
  .run(['$rootScope', 'errorSvc', runFunction]);

function routerConfig($routeProvider) {
  $routeProvider
    .when('/', {
      title: 'Narrative Producer',
      template: '<np-root-template></np-root-template>'
    })
    .when('/test', {
       title: 'Iscripts testing capistrano deployment ...',
       template: '<np-projects-container></np-projects-container>'
     })
    .when('/auth', {
      template: '<np-auth-template></np-auth-template>',
      reloadOnSearch: false
    })
    .when('/account', {
      template: [
        '<div class="standaloneAncillaryPage">',
        '	<np-nav on-logout="logout()"></np-nav>',
        '	<h1>My Account</h1>',
        '	<div itt-user></div>',
        '</div>'
      ].join(''),
      controller: ['$scope', 'authSvc', function ($scope, authSvc) {
        $scope.authSvc = authSvc;
        $scope.logout = $scope.authSvc.logout;
      }]
    })
    .when('/stories', {
      title: 'Available Narratives',
      template: `<np-narratives-container></np-narratives-container>`
    })
    .when('/story/:narrativePath', {
      title: 'Narrative',
      template: `<np-narrative-container></np-narrative-container>`,
      resolve: {
        narrativeResolve: ['$route', '$q', 'authSvc', 'dataSvc', 'modelSvc', 'ittUtils',
          function ($route, $q, authSvc, dataSvc, modelSvc, ittUtils) {
            var pathOrId = $route.current.params.narrativePath;
            //this only pulls from the cache.
            var cachedNarr = modelSvc.getNarrativeByPathOrId(pathOrId);
            var cachedCustomer;

            var doPullFromCache = ittUtils.existy(cachedNarr) &&
              ittUtils.existy(cachedNarr.path_slug) &&
              ittUtils.existy(cachedNarr.timelines) &&
              (cachedNarr.path_slug.en === pathOrId || cachedNarr._id === pathOrId);

            if (doPullFromCache) {
              cachedCustomer = modelSvc.customers[cachedNarr.customer_id];
              return $q(function (resolve) {
                return resolve({ n: cachedNarr, c: [cachedCustomer] });
              });
            }
            return dataSvc.getNarrative(pathOrId).then(function (narrativeData) {
              return dataSvc.getCustomer(narrativeData.customer_id, true).then(function (customer) {
                return { n: narrativeData, c: [customer] };
              });
            });
          }]
      }
    })
    .when('/story/:narrativePath/:timelinePath', {
      template: '<div itt-narrative-timeline></div>',
      resolve: {
        product: ['appState', function (appState) {
          appState.init();
          appState.product = 'player';
          appState.productLoadedAs = 'narrative';
        }]
      }
    })
    .when('/projects', {
      title: 'Available projects',
      template: '<np-projects-container></np-projects-container>'
    })
    .when('/episode/:epId', {
      title: 'Narrative Producer',
      template: '<itt-player-container></itt-player-container>',
      resolve: {
        product: ['appState', function (appState) {
          appState.init();
          appState.product = 'player';
          appState.productLoadedAs = 'player';
        }]
      }
    })
    .when('/episode/:epId/:viewMode', {
      title: 'Narrative Producer',
      template: '<itt-player-container></itt-player-container>',
      resolve: {
        product: ['appState', function (appState) {
          appState.init();
          appState.product = 'player';
          appState.productLoadedAs = 'player';
        }]
      }
    })
    .when('/sxs/:epId', {
      title: 'Narrative Producer',
      template: '<itt-player-container></itt-player-container>',
      resolve: {
        product: ['appState', function (appState) {
          appState.init();
          appState.product = 'sxs';
          appState.productLoadedAs = 'sxs';
        }]
      }
    })
    .when('/editor/:epId', {
      title: 'Narrative Producer',
      template: '<itt-player-container></itt-player-container>',
      resolve: {
        product: ['appState', function (appState) {
          appState.init();
          appState.product = 'sxs';
          appState.productLoadedAs = 'sxs';
        }]
      }
    })
    .when('/producer/:epId', {
      title: 'Narrative Producer',
      template: '<itt-player-container></itt-player-container>',
      resolve: {
        product: ['$route', 'appState', ($route, appState) => {
          appState.init();
          appState.episodeId = appState.episodeId = $route.current.params.epId;
          appState.product = 'producer';
          appState.productLoadedAs = 'producer';
        }]
      }
    })
    .when('/assets/:containerId', {
      title: 'Container Assets test',
      template: '<np-assets-resolve></np-assets-resolve>'
    })
    .otherwise({
      title: 'Narrative Producer: Error',
      controller: 'ErrorController',
      template: '<np-error-404-template></np-error-404-template>'
    });

  //$locationProvider.html5Mode(false); // TODO we had trouble getting the server config working for this... thought we had it but IE still choked
}

function xDomainConfig($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    /.*/,
    /^http(s)?:\/\/platformuniv-p.edgesuite.net/,
    /^http(s)?:\/\/themes.googleusercontent.com/
  ]);
}

function authInterceptorConfig($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $httpProvider.interceptors.push(['$q', 'errorSvc', function ($q, errorSvc) {
    return {
      'responseError': function (rejection) {

        if (rejection.data && rejection.data.path_slug) {
          return $q(function (resolve, reject) {
            return reject(rejection);
          });
        }

        errorSvc.error(rejection);
        return $q.reject(rejection);
      }
    };
  }]);
}

function debugInfoConfig($compileProvider) {
  let isDev = false;
  const currentHost = window.location.hostname;
  if (currentHost.indexOf('localhost') === 0 ||
    currentHost.indexOf('api-dev') === 0 ||
    currentHost.indexOf('np-dev') === 0) {
    isDev = true;
  }

  if (isDev === false) {
    $compileProvider.debugInfoEnabled(false);
  }
}

function runFunction($rootScope, errorSvc) {

  $rootScope.$on('$routeChangeSuccess', function (event, currentRoute) {
    document.title = currentRoute.title ? currentRoute.title : 'Narrative Producer';
    errorSvc.init(); // clear display of any errors from the previous route
  });
  // globally emit rootscope event for certain keypresses:
  var fhotkb = false; // user's forehead is not on the keyboard
  $(document).on('keydown', function (e) {
    if (
      fhotkb ||
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.attributes.contenteditable
    ) {
      return;
    }

    fhotkb = true;
    if (e.keyCode === 27) {
      $rootScope.$emit('userKeypress.ESC');
      e.preventDefault();
    }
    if (e.which === 32) {
      $rootScope.$emit('userKeypress.SPACE');
      e.preventDefault();
    }

  });
  $(document).on('keyup', function () {
    fhotkb = false; // oh good they've woken up
  });
}
