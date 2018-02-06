// @npUpgrade-player-false
// test update by Joseph Bowik -- only for testing of Angular upgrade
/* For now this is just a thin wrapper around the playerController */
import { IDataSvc } from '../../../interfaces';
import { INarrative } from '../../../models';
import playerTimelineHtml from './player-timeline.html';



  export interface INPNarrativeTimeline {
    // return {
    restrict: string;
    replace: boolean,
    template: string;
    controller: NarrativeTimelineCtrl,
    Name: string;
    // };
  }
  
export class NarrativeTimelineCtrl implements INPNarrativeTimeline {

    restrict: string = 'A';
    replace = true;
    controller;
    Name = 'NarrativeTimelineCtrl'; // tslint:disable-line
    // static $inject = ['$q', 'awsSvc'];
    static $inject = [
        '$scope',
        '$routeParams',
        '$location',
        'dataSvc',
        'appState',
        'authSvc',
        'errorSvc'
    ];

    template: `<span>
	<div ng-if="showPlayer">
    <itt-player-container></itt-player-container>
  </div>
</span>`;

    constructor(
        public $scope: ng.IScope,
        private $routeParams,
        private $location: ng.ILocationService,
        private dataSvc: IDataSvc,
        private appState,
        private authSvc,
        private errorSvc
    ) {
    }

    private narrative;
    private showPlayer: boolean;
    private socialShareInfo: {};
    private enableSocialSharing: boolean;
    




  static factory(): ng.IDirectiveFactory {
    const directiveInstance =
      ($scope, $routeParams, $location, dataSvc, appState, authSvc, errorSvc) => new NarrativeTimelineCtrl($scope, $routeParams, $location, dataSvc, appState, authSvc, errorSvc);
    directiveInstance.$inject = NarrativeTimelineCtrl.$inject;
    return directiveInstance;
  }

  $onInit() {
  this.disableSocialShareOnDev();
  // this.appState.init();
  console.log('narrative timeline init!');

  this.dataSvc.getNarrative(this.$routeParams.narrativePath)
    .then((narrative: INarrative) => {
      this.appState.narrativeId = narrative._id;
      this.narrative = narrative;

      const narrativeRole = this.authSvc.getRoleForNarrative(narrative._id);
      const defaultProduct = this.authSvc.getDefaultProductForRole(narrativeRole);
      let currentTl = Object.create(null);
      let tlTitle = '';
      let tlId = '';
      this.appState.product = defaultProduct;
      angular.forEach(narrative.timelines, (timeline) => {
        if (
          timeline._id === this.$routeParams.timelinePath ||
          timeline.path_slug.en === this.$routeParams.timelinePath
        ) {
          currentTl = timeline;
          tlTitle = timeline.name.en;
          tlId = timeline._id;
          this.appState.timelineId = timeline._id;
          if (timeline.episode_segments[0]) {
            this.appState.episodeId = timeline.episode_segments[0].episode_id;
            this.appState.episodeSegmentId = timeline.episode_segments[0]._id;
            this.showPlayer = true;
          }
        }
      });

      const narrativeUrl = narrative.path_slug.en;
      const timelineUrl = currentTl.path_slug.en;
      const { narrative_subdomain: subDomain } = narrative;
      if (narrative.enable_social_sharing === true && this.enableSocialSharing === true) {

        this.socialShareInfo = {
          subDomain,
          tlTitle,
          narrative: narrativeUrl,
          timeline: { url: timelineUrl, id: tlId }
        };
      }

      if (!this.appState.episodeId) {
        this.errorSvc.error({
          data: 'Sorry, no episode was found in this timeline.'
        });
      }
    });
   }

  private disableSocialShareOnDev() {
    this.enableSocialSharing = !(/api-dev|np-dev|demo/.test(this.$location.host()));
  }

}

// ittNarrativeTimeline.$inject = ['$routeParams', '$location', 'dataSvc', 'appState', 'authSvc', 'errorSvc'];

