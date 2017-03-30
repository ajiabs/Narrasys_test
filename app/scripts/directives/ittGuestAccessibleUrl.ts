/**
 * Created by githop on 3/16/17.
 */

export default function ittGuestAccessibleUrl() {
  return {
    restrict: 'EA',
    template: [
      '<div ng-if="!$ctrl.clipboardMode">',
      ' <div ng-if="$ctrl.narrative.guest_access_allowed === true">',
      '	    <label for="{{$ctrl.display.id[$ctrl.type]}}">Guest Accessible URL:',
      '       <itt-validation-tip ng-if="$ctrl[$ctrl.type].error" text="{{$ctrl[$ctrl.type].error}}"></itt-validation-tip>',
      '       <p class="--break-word"><small ng-class="{ \'error-red\': $ctrl[$ctrl.type].error, unselectable: $ctrl[$ctrl.type].error }">{{$ctrl.formatGuestAccessibleUrl()}}</small></p>',
      '     </label>',
      '     <input id="{{$ctrl.display.id[$ctrl.type]}}" type="text" name="path" placeholder="{{$ctrl.display.placeholder}}" itt-valid-pathslug narrative-id="{{$ctrl.narrative._id}}" ng-model="$ctrl[$ctrl.type].path_slug.en">',
      ' </div>',
      '</div>',
      '<a ng-if="$ctrl.clipboardMode" itt-clipboard source-text="{{$ctrl.formatUrlToCopy()}}" on-copy="$event.stopPropagation()"></a>'
    ].join(''),
    scope: {
      narrative: '=',
      timeline: '=?',
      customer: '=?',
      clipboardMode: '@?',
      subDomain: '@?'
    },
    controller: ['ittUtils', function (ittUtils) {
      var ctrl = this;
      var _existy = ittUtils.existy;
      var _slugify = ittUtils.slugify;
      var protocol = 'https://';
      var domain = '.narrasys.com/';
      var pathPrefix;

      angular.extend(ctrl, {
        type: _existy(ctrl.timeline) ? 'timeline' : 'narrative',
        display: null,
        formatLTIUrl: formatLTIUrl,
        formatGuestAccessibleUrl: formatGuestAccessibleUrl,
        formatUrlToCopy: formatUrlToCopy
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
        var _subDomain = _existy(ctrl.subDomain) && ctrl.subDomain || _existy(ctrl.narrative.subDomain) && ctrl.narrative.subDomain;
        pathPrefix = protocol + _subDomain + domain;
      }

      function formatUrlToCopy() {
        if (_existy(ctrl.narrative) && ctrl.narrative.guest_access_allowed === false) {
          return formatLTIUrl();
        } else {
          return formatGuestAccessibleUrl();
        }
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
          return pathPrefix + '#/story/' + ctrl.narrative.path_slug.en + '/' + _slugify(ctrl.timeline.path_slug.en);
        }

        if (hasNarrativePathslug) {
          return pathPrefix + '#/story/' + _slugify(ctrl.narrative.path_slug.en);
        }

      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
