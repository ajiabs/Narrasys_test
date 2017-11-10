/**
 * Created by githop on 3/16/17.
 */
import { ICustomer, INarrative, ITimeline } from '../../../models';
import { existy, slugify } from '../../../shared/services/ittUtils';

const TEMPLATE = `
<div ng-if="!$ctrl.clipboardMode">
  <div ng-if="$ctrl.narrative.guest_access_allowed === true">
    <label for="{{$ctrl.display.id[$ctrl.type]}}">Guest Accessible URL:
      <itt-validation-tip ng-if="$ctrl[$ctrl.type].error" text="{{$ctrl[$ctrl.type].error}}"></itt-validation-tip>
      <p class="--break-word">
        <small ng-class="{ 'error-red': $ctrl[$ctrl.type].error, unselectable: $ctrl[$ctrl.type].error }">
          {{$ctrl.formatGuestAccessibleUrl()}}
        </small>
      </p>
    </label>
    <input
      id="{{$ctrl.display.id[$ctrl.type]}}"
      type="text"
      name="path"
      placeholder="{{$ctrl.display.placeholder}}"
      itt-valid-pathslug
      narrative-id="{{$ctrl.narrative._id}}"
      ng-model="$ctrl[$ctrl.type].path_slug.en">
  </div>
</div>
<np-clipboard
  ng-if="$ctrl.clipboardMode"
  source-text="{{$ctrl.formatUrlToCopy()}}"
  on-copy="$event.stopPropagation()">
</np-clipboard>
`;

interface IGuestAccessibleUrlBindings extends ng.IComponentController {
  narrative: INarrative;
  timeline?: ITimeline;
  customer?: ICustomer;
  clipboardMode?: string;
  subDomain: string;
}

interface IDisplay {
  placeholder: string;
  id: { timeline: string, narrative: string };
}

class GuestAccessibleUrlController implements IGuestAccessibleUrlBindings {
  narrative: INarrative;
  timeline?: ITimeline;
  customer?: ICustomer;
  clipboardMode?: string;
  subDomain: string;
  type: 'timeline' | 'narrative';
  display: IDisplay;
  private protocol: string = 'https://';
  private domain: string = '.narrasys.com/';
  private pathPrefix: string;
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    this.type = existy(this.timeline) ? 'timeline' : 'narrative';
    this.display = {
      id: {
        timeline: 'tlPath',
        narrative: 'nPath'
      },
      placeholder: 'human-friendly-link-to ' + this.type
    };

    const _subDomain =
      existy(this.subDomain) && this.subDomain ||
      existy(this.narrative.narrative_subdomain) && this.narrative.narrative_subdomain;

    this.pathPrefix = this.protocol + _subDomain + this.domain;
  }

  formatLTIUrl() {
    if (existy(this.narrative)) {
      if (this.type === 'timeline') {
        return this.pathPrefix + 'auth/lti?narrative=' + this.narrative._id + '&timeline=' + this.timeline._id;
      }
      return this.pathPrefix + 'auth/lti?narrative=' + this.narrative._id;
    }
  }

  formatGuestAccessibleUrl() {
    const hasNarrative = existy(this.narrative);
    const hasNarrativePathslug = hasNarrative
      && existy(this.narrative.path_slug)
      && existy(this.narrative.path_slug.en);

    const hasTimeline = existy(this.timeline);
    const hasTimelinePathslug = hasTimeline && existy(this.timeline.path_slug) && existy(this.timeline.path_slug.en);
    if (this.type === 'timeline' && hasTimelinePathslug) {
      return this.pathPrefix + '#/story/' + this.narrative.path_slug.en + '/' + slugify(this.timeline.path_slug.en);
    }

    if (hasNarrativePathslug) {
      return this.pathPrefix + '#/story/' + slugify(this.narrative.path_slug.en);
    }
  }

  formatUrlToCopy() {
    if (existy(this.narrative) && this.narrative.guest_access_allowed === false) {
      return this.formatLTIUrl();
    } else {
      return this.formatGuestAccessibleUrl();
    }
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class GuestAccessibleUrl implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    narrative: '<',
    timeline: '<?',
    customer: '<?',
    clipboardMode: '@?',
    subDomain: '@?'
  };
  template: string = TEMPLATE;
  controller = GuestAccessibleUrlController;
  static Name: string = 'npGuestAccessibleUrl'; // tslint:disable-line
}

 /* tslint:disable */
// export default function ittGuestAccessibleUrl() {
//   return {
//     restrict: 'EA',
//     template: [
//       '<div ng-if="!$ctrl.clipboardMode">',
//       ' <div ng-if="$ctrl.narrative.guest_access_allowed === true">',
//       '	    <label for="{{$ctrl.display.id[$ctrl.type]}}">Guest Accessible URL:',
//       '       <itt-validation-tip ng-if="$ctrl[$ctrl.type].error" text="{{$ctrl[$ctrl.type].error}}"></itt-validation-tip>',
//       '       <p class="--break-word"><small ng-class="{ \'error-red\': $ctrl[$ctrl.type].error, unselectable: $ctrl[$ctrl.type].error }">{{$ctrl.formatGuestAccessibleUrl()}}</small></p>',
//       '     </label>',
//       '     <input id="{{$ctrl.display.id[$ctrl.type]}}" type="text" name="path" placeholder="{{$ctrl.display.placeholder}}" itt-valid-pathslug narrative-id="{{$ctrl.narrative._id}}" ng-model="$ctrl[$ctrl.type].path_slug.en">',
//       ' </div>',
//       '</div>',
//       '<a ng-if="$ctrl.clipboardMode" itt-clipboard source-text="{{$ctrl.formatUrlToCopy()}}" on-copy="$event.stopPropagation()"></a>'
//     ].join(''),
//     scope: {
//       narrative: '=',
//       timeline: '=?',
//       customer: '=?',
//       clipboardMode: '@?',
//       subDomain: '@?'
//     },
//     controller: ['ittUtils', function (ittUtils) {
//       var ctrl = this;
//       var _existy = ittUtils.existy;
//       var _slugify = ittUtils.slugify;
//       var protocol = 'https://';
//       var domain = '.narrasys.com/';
//       var pathPrefix;
//
//       angular.extend(ctrl, {
//         type: _existy(ctrl.timeline) ? 'timeline' : 'narrative',
//         display: null,
//         formatLTIUrl: formatLTIUrl,
//         formatGuestAccessibleUrl: formatGuestAccessibleUrl,
//         formatUrlToCopy: formatUrlToCopy
//       });
//
//       onInit();
//
//       function onInit() {
//         ctrl.display = {
//           id: {
//             timeline: 'tlPath',
//             narrative: 'nPath'
//           },
//           placeholder: 'human-friendly-link-to ' + ctrl.type
//         };
//         var _subDomain = _existy(ctrl.subDomain) && ctrl.subDomain || _existy(ctrl.narrative.narrative_subdomain) && ctrl.narrative.narrative_subdomain;
//         pathPrefix = protocol + _subDomain + domain;
//       }
//
//       function formatUrlToCopy() {
//         if (_existy(ctrl.narrative) && ctrl.narrative.guest_access_allowed === false) {
//           return formatLTIUrl();
//         } else {
//           return formatGuestAccessibleUrl();
//         }
//       }
//
//       function formatLTIUrl() {
//         if (_existy(ctrl.narrative)) {
//           if (ctrl.type === 'timeline') {
//             return pathPrefix + 'auth/lti?narrative=' + ctrl.narrative._id + '&timeline=' + ctrl.timeline._id;
//           }
//           return pathPrefix + 'auth/lti?narrative=' + ctrl.narrative._id;
//         }
//       }
//
//       function formatGuestAccessibleUrl() {
//         var hasNarrative = _existy(ctrl.narrative);
//         var hasNarrativePathslug = hasNarrative && _existy(ctrl.narrative.path_slug) && _existy(ctrl.narrative.path_slug.en);
//         var hasTimeline = _existy(ctrl.timeline);
//         var hasTimelinePathslug = hasTimeline && _existy(ctrl.timeline.path_slug) && _existy(ctrl.timeline.path_slug.en);
//         if (ctrl.type === 'timeline' && hasTimelinePathslug) {
//           return pathPrefix + '#/story/' + ctrl.narrative.path_slug.en + '/' + _slugify(ctrl.timeline.path_slug.en);
//         }
//
//         if (hasNarrativePathslug) {
//           return pathPrefix + '#/story/' + _slugify(ctrl.narrative.path_slug.en);
//         }
//
//       }
//
//     }],
//     controllerAs: '$ctrl',
//     bindToController: true
//   };
// }
