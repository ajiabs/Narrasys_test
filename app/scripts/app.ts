'use strict';


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

const templates = (require as any).context('../templates', true, /\.html$/);
const componentTemplates = (require as any).context('./directives', true, /\.html$/);

[templates, componentTemplates].forEach((templateSource) => {
  templateSource.keys().forEach(path => templateSource(path));
});

import '../styles/app.scss';
import '../styles/vendor.scss';

import './plugin/plugins';
import 'core-js/client/shim';
import 'angular';
import 'angular-ui-tree';
//text angular
import 'rangy';
import 'rangy/lib/rangy-selectionsaverestore';
import 'textAngular/dist/textAngular-sanitize.min';
import 'textAngular/dist/textAngular.min';
import 'angular-socialshare';
//end text angular
import '../config';

import './controllers/controllers.module';
import './filters/filters';
import './services/services.module';
import './directives/directives.module';

let itt = angular.module('iTT', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'textAngular',
    'ui.tree',
    '720kb.socialshare',
    'itt.controllers',
    'itt.filters',
    'itt.services',
    'itt.directives'
  ]
)
  .constant('MIMES', {
    'assetLib': 'image/*,text/plain,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf',
    'file': 'text/plain,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf',
    'default': 'image/*',
    'transcripts': 'text/vtt,text/srt'
  })
  //TODO merge constants below into playbackservice/index as exports
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
  // Configuration for textAngular toolbar
  .config(['$provide', textAngularConfig])
  //config for debug info disable
  .config(['$compileProvider', debugInfoConfig])
  .run(['$rootScope', 'errorSvc', runFunction]);

function routerConfig($routeProvider) {
  $routeProvider
    .when('/', {
      title: 'Narrative Producer',
      templateUrl: 'templates/root.html'
    })
    .when('/auth', {
      templateUrl: 'templates/auth.html',
      reloadOnSearch: false
    })
    .when('/account', {
      template: [
        '<div class="standaloneAncillaryPage">',
        '	<itt-nav on-logout="logout()"></itt-nav>',
        '	<h1>My Account</h1>',
        '	<div itt-user></div>',
        '</div>'
      ].join(''),
      controller: ['$scope', 'authSvc', function ($scope, authSvc) {
        $scope.logout = authSvc.logout;
      }]
    })
    .when('/stories', {
      title: 'Available Narratives',
      template: `<np-narratives-container></np-narratives-container>`
    })
    .when('/story/:narrativePath', {
      title: 'Narrative',
      template: `<np-narrative-container></np-narrative-container>`
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
      templateUrl: 'templates/producer/episodelist.html'
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
      controller: 'ContainerAssetsTestController',
      template: [
        '<div class="standaloneAncillaryPage">',
        '	<itt-nav on-logout="logout()"></itt-nav>',
        '	<div>',
        '		<sxs-container-assets container-id="{{containerId}}" mime-key="assetLib"></sxs-container-assets>',
        '	</div>',
        '</div>'].join(''),
      resolve: {
        authEffects: ['authSvc', function (authSvc) {
          //to ensure that canAccess is properly set.
          return authSvc.authenticate().then(angular.noop);
        }]
      }
    })
    .when('/event/:eventId', {
      title: 'Event test',
      controller: 'EventTestController',
      templateUrl: 'templates/testbed-event.html'
    })
    .otherwise({
      title: 'Narrative Producer: Error',
      controller: 'ErrorController',
      templateUrl: 'templates/error-404.html'
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

function textAngularConfig($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
    taOptions.defaultFileDropHandler = function (a, b) {
    }; //jshint ignore:line
    taOptions.toolbar = [
      ['h1', 'h2', 'h3'],
      ['bold', 'italics', 'underline', 'strikeThrough'],
      ['ul', 'ol'],
      ['undo', 'redo', 'clear']
      // ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      // ['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
      // ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
    ];
    return taOptions;
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
