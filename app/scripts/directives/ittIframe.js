/**
 *
 * Created by githop on 12/8/15.
 */

(function () {
	'use strict';
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
	angular.module('com.inthetelling.story')
		.directive('ittIframe', ittIframe)
		.controller('ittIframeCtrl', ittIframeCtrl);

	function ittIframe(appState) {
		return {
			restrict: 'E',
			scope: {
				src: '@',
				contenttype: '@',
				item: '&'
			},
			replace: true,
			templateUrl: 'templates/iframe.html',
			controller: 'ittIframeCtrl',
			controllerAs: 'iframeCtrl',
			bindToController: true,
			link: linkFn
		};

		function linkFn(scope, elm) {
			var _btnConst = 95;

			var _unWatch = angular.noop;
			var _toolbarH = 75;
			var _timelineBarH = 145;
			var _offsetConst = _toolbarH + _timelineBarH;
			var _modalWrapper = $('.w-modal');
			var _otherModal   = $('.modal');
			var _frameBottom = $(window).height() - _offsetConst;

			if (_otherModal.length > 0 && appState.isTouchDevice) {
				//set dimenions on <iframe>
				scope.iframeCtrl.styles = {'height': _frameBottom + 'px'};
				//set dimensions on iframeContainer div
				elm.css('height', _frameBottom);
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

				_unWatch =  scope.$watch(function() {
					return _modalWrapper.height();
				}, function(newVal, oldVal) {
					if (newVal !== oldVal) {
						var newY = newVal - _btnConst;
						elm.css('height', newY);
					}
				});
			}

			function resizeIframeReviewMode() {
				//only resize iframe in discover mode for the narrasys pro template (at the moment)
				if (appState.viewMode === 'discover' &&
					appState.playerTemplate === 'templates/episode/narrasys-pro.html' &&
					!appState.isTouchDevice) {
					elm.css('height', _frameBottom);
				}
			}


			scope.$on('$destroy', function() {
				_unWatch();
			});
		}


	}

	function ittIframeCtrl($scope, youtubeSvc, appState) {
		// moved this all back out of the controller to avoid leaking $scope.sandbox across directives
		var _ctrl = this; //jshint ignore:line
		var _sandboxAttrs = 'allow-forms allow-same-origin allow-scripts';
		var _popupsTopWindow = ' allow-top-navigation allow-popups';
		_ctrl.isYoutube = false;
		_ctrl.isTouchDevice = appState.isTouchDevice;

		if (youtubeSvc.extractYoutubeId(_ctrl.src)) {
			_ctrl.isYoutube = true;
		}
		//set scrolling to no if we're on an ipad
		//and we're attempting to iframe our own player
		//this stops the player from expanding the iframe its contained in.
		if (_ctrl.isTouchDevice && /inthetelling.com\/#/.test(_ctrl.src)) {
			_ctrl.iOSScroll = 'no';
		}

		_ctrl.watcher = $scope.$watchGroup([function() {return _ctrl.src;}, function() {return _ctrl.contenttype;}], function () {
			if (!_ctrl.src) {
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
	}

})();
