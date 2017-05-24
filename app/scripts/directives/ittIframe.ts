/**
 *
 * Created by githop on 12/8/15.
 */
/**
 * @ngdoc directive
 * @name iTT.directive:ittIframe
 * @restrict 'E'
 * @scope
 * @description
 * Directive used to display iframed content
 * @requires appState
 * @param {String} src The Source URL for the iframe
 * @param {String=} contenttype The mime type of the iframed content
 * @param {Object} item The Item object, aka an Event from the Database
 * @example
 * <pre>
 *     <itt-iframe src="<url>" contenttype="text/html" item="<itemObject>"></itt-iframe>
 * </pre>
 */
ittIframe.$inject = ['appState'];

export default function ittIframe(appState) {
  return {
    restrict: 'E',
    scope: {
      src: '@',
      contenttype: '@',
      item: '&'
    },
    replace: true,
    templateUrl: 'templates/iframe.html',
    controller: ['$scope', 'ittUtils', 'appState',
      function ($scope, ittUtils, appState) {
        // moved this all back out of the controller to avoid leaking $scope.sandbox across directives
        var _ctrl = this; //jshint ignore:line
        var _sandboxAttrs = 'allow-forms allow-same-origin allow-scripts';
        var _popupsTopWindow = ' allow-top-navigation allow-popups';
        _ctrl.isLoading = true;
        _ctrl.isTouchDevice = appState.isTouchDevice;


        function validateFrameUrl(url) {
          if (ittUtils.isValidURL(url)) {
            _ctrl.isLoading = false;
            return true;
          } else {
            _ctrl.isLoading = true;
            return false;
          }

        }

        //set scrolling to no if we're on an ipad
        //and we're attempting to iframe our own player
        //this stops the player from expanding the iframe its contained in.
        if (_ctrl.isTouchDevice && /inthetelling.com\/#/.test(_ctrl.src)) {
          _ctrl.iOSScroll = 'no';
        }

        _ctrl.watcher = $scope.$watchGroup([function () {
          return _ctrl.src;
        }, function () {
          return _ctrl.contenttype;
        }], function () {
          if (!_ctrl.src || !validateFrameUrl(_ctrl.src)) {
            return;
          }

          if (_ctrl.contenttype) {
            // Uploads will always have a content type; we can trust it:
            _ctrl.sandbox = (_ctrl.contenttype === 'text/html') ? _sandboxAttrs : undefined;
          } else {
            // no content type for links, so we have to fall back on string matching.
            // Ideally we'd only apply the sandbox to html files, but that's hard to match, so for now we'll
            // default to sandbox unless proven otherwise.
            _ctrl.sandbox = _sandboxAttrs;

            // Remove it for PDFs (for now; probably we'll be growing this list later on)
            if (_ctrl.src.match(/.pdf$/)) {
              delete _ctrl.sandbox;
            }
            //give ourselves more permission
            if (_ctrl.src.match(/inthetelling.com\/#/)) {
              _ctrl.sandbox += _popupsTopWindow;
            }

            //for certain browsers, see: TS-757 and TS-773
            if (_ctrl.src.match(/inthetelling.com\/#/) && _ctrl.src.indexOf('?') === -1) {
              _ctrl.src += '?embed=1';
            }

            // Looks like we have some episodes where production used Links item types to point to asset uploads,
            // because upload templates  were broken (see TS-839). Would have been nice if they'd reported that
            // so we could fix it, but they didn't, so we'll clean up after them.

            // These won't have a file extension to match on, so we'll have to just
            // assume that anything in our upload space won't have a framebreaker.
            // URLs are either https://s3.amazonaws.com/ITT_Assets or https://s3.amazonaws.com/itt.user.uploads

            // TODO check to see if they always used ITT_Assets -- if so we can still protect against end-user uploads
            // of framebreaking files by using .match(/amazonaws.com\/ITT/) instead
            if (_ctrl.src.match(/amazonaws.com\/itt/i)) {
              delete _ctrl.sandbox;
            }
          }
        });

        $scope.$on('$destroy', function () {
          _ctrl.watcher();
        });
      }],
    controllerAs: '$ctrl',
    bindToController: true,
    link: function (scope, elm) {
      var _btnConst = 95;

      var _unWatch = angular.noop;
      var _toolbarH = 75;
      var _timelineBarH = 145;
      var _offsetConst = _toolbarH + _timelineBarH;
      var _modalWrapper = $('.w-modal');
      var _otherModal = $('.modal');
      var _frameBottom = $(window).height() - _offsetConst;

      if (_otherModal.length > 0 && appState.isTouchDevice) {
        //set dimenions on <iframe>
        scope.$ctrl.styles = {'height': _frameBottom + 'px'};
        //set dimensions on iframeContainer div
        elm.css('height', _frameBottom);

        scope.$watch(function () {
          return elm.height();
        }, function (newVal, oldval) {
          if (newVal !== oldval) {
            scope.$ctrl.styles = {'height': newVal + 'px'};
            elm.css('height', _frameBottom);
          }
        });
      }
      //search for the 'w-modal" class, if we find one,
      //then we know that we are using windowfg template, which seems to handle modals.
      if (_modalWrapper.length > 0) {
        setIframeHeight();
      } else {
        resizeIframeReviewMode();
      }

      function setIframeHeight() {
        var y = _modalWrapper.height() - _btnConst;
        elm.css('height', y);
        _modalWrapper.css('overflow-y', 'hidden');

        _unWatch = scope.$watch(function () {
          return _modalWrapper.height();
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            var newY = newVal - _btnConst;
            elm.css('height', newY);
          }
        });
      }


      function resizeIframeReviewMode() {
        var narrasys = 'templates/episode/narrasys-pro.html';
        var cpb = 'templates/episode/career-playbook.html';

        //only resize iframe in discover mode for the narrasys pro template (at the moment)
        if (appState.viewMode === 'discover' &&
          (appState.playerTemplate === narrasys || appState.playerTemplate === cpb) &&
          !appState.isTouchDevice) {
          elm.css('height', _frameBottom);
        }
      }


      scope.$on('$destroy', function () {
        _unWatch();
      });
    }
  };
}
