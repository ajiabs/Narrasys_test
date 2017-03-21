/**
 * Created by githop on 3/16/17.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittGuestAccessibleUrl', ittGuestAccessibleUrl);

  function ittGuestAccessibleUrl() {
    return {
      restrict: 'EA',
      template: [
        '<div>',
        ' <div ng-if="$ctrl.showLTIUrl()">',
        '   <label>LTI Url:</label><p class="--break-word"><small>{{::$ctrl.formatLTIUrl()}}</small></p>',
        ' </div>',
        ' <div ng-if="$ctrl.narrative.guest_access_allowed === true">',
        '     <itt-validation-tip ng-if="$ctrl.error" text="{{$ctrl.error}}"></itt-validation-tip>',
        '	    <label for="{{$ctrl.display.id[$ctrl.type]}}">Guest Accessible URL:</label><p class="--break-word"><small>{{$ctrl.formatGuestAccessibleUrl() | slugify}}</small></p>',
        '     <input id="{{$ctrl.display.id[$ctrl.type]}}" type="text" name="path" placeholder="{{$ctrl.display.placeholder}}" ng-model="$ctrl[$ctrl.type].path_slug.en">',
        ' </div>',
        '</div>'
      ].join(''),
      scope: {
        narrative: '=',
        timeline: '=?',
        subDomain: '@?',
        error: '@?'
      },
      controller: ['ittUtils', function(ittUtils) {
        var ctrl = this;
        var _existy = ittUtils.existy;
        var protocol = 'https://';
        var domain = '.narrasys.com/';
        var pathPrefix;

        angular.extend(ctrl, {
          type: _existy(ctrl.timeline) ? 'timeline' : 'narrative',
          display: null,
          showLTIUrl: showLTIUrl,
          formatLTIUrl: formatLTIUrl,
          formatGuestAccessibleUrl: formatGuestAccessibleUrl
        });

        onInit();

        function onInit() {
          ctrl.display = {
            id: {
              timeline: 'tlPath',
              narrative: 'nPath'
            },
            placeholder: 'human-friendly-link-to ' + ctrl.type
          };
          ctrl.subDomain = _existy(ctrl.subDomain) && ctrl.subDomain || _existy(ctrl.narrative.subDomain) && ctrl.narrative.subDomain;
          pathPrefix = protocol + ctrl.subDomain + domain;
        }

        function showLTIUrl() {
          if (_existy(ctrl.narrative) && ctrl.narrative.guest_access_allowed === false) {
            if (ctrl.type === 'timeline') {
              return _existy(ctrl.timeline._id);
            }
            return _existy(ctrl.narrative._id);
          }
          return false;
        }

        function formatLTIUrl() {
          if (_existy(ctrl.narrative)) {
            if (ctrl.type === 'timeline') {
              return pathPrefix + 'auth/lti?narrative=' + ctrl.narrative._id + '&timeline=' + ctrl.timeline._id;
            }
            return pathPrefix + 'auth/lti?narrative=' + ctrl.narrative._id;
          }
        }

        function formatGuestAccessibleUrl() {
          var hasNarrative = _existy(ctrl.narrative);
          var hasNarrativePathslug = hasNarrative && _existy(ctrl.narrative.path_slug) && _existy(ctrl.narrative.path_slug.en);
          var hasTimeline = _existy(ctrl.timeline);
          var hasTimelinePathslug = hasTimeline && _existy(ctrl.timeline.path_slug) && _existy(ctrl.timeline.path_slug.en);

          if (ctrl.type === 'timeline' && hasTimelinePathslug) {
            return pathPrefix + 'story/' + ctrl.narrative.path_slug.en + '/' + ctrl.timeline.path_slug.en;
          }

          if (hasNarrativePathslug) {
            return pathPrefix + 'story/' + ctrl.narrative.path_slug.en;
          }

        }

      }],
      controllerAs: '$ctrl',
      bindToController: true
    };
  }


})();
