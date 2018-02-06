// @npUpgrade-inputFields-true
/*
 The "add" buttons for instructors to choose what type of content they want to add to the episode.

 TODO make this smarter about when it shows buttons; for example instead of matching against appState.time,
 look for current scene.id matching "internal".  Dim buttons instead of hiding them completely.

 */

import { IEpisodeEditService } from '../../../episode/services/episodeEdit.service';
import { IEvent } from '../../../../models';

const TEMPLATE = `
<div ng-show="!$ctrl.appState.editEvent && !$ctrl.appState.editEpisode" class="controlPanel" ng-class="{
	isProducer: $ctrl.appState.product == 'producer',
	isSxS: $ctrl.appState.product == 'sxs'
}">

	<div ng-if="$ctrl.appState.product == 'producer'" class="editButtonPanel">
		<a class="button button-episode" ng-click="$ctrl.editEpisode()">Edit episode</a>
		<a
		  class="button button-scene"
		  ng-if="$ctrl.renderAddLayoutButton"
		  ng-click="$ctrl.episodeEdit.editCurrentScene()">Edit Layout</a>
	</div>

	<div class="producer addButtonPanel" ng-show="$ctrl.showAddEventButton">
		<span ng-if="$ctrl.expanded" style="padding: 0 1em" class="animate transitionExpandW">
			<span ng-if="$ctrl.appState.product == 'sxs'">
				<a class="button button-comment" ng-click="$ctrl.addEvent('annotation')">Comment</a>
				<a class="button button-link" ng-click="$ctrl.addEvent('link')">Link</a>
				<a class="button button-question" ng-click="$ctrl.addEvent('question')">Question</a>
				<a class="button button-image" ng-click="$ctrl.addEvent('image')">Image</a>
				<a class="button button-file" ng-click="$ctrl.addEvent('file')">File</a>
				<a class="button button-video" ng-click="$ctrl.addEvent('video')">Video</a>
			</span>
			<span ng-if="$ctrl.appState.product == 'producer'">
				<a class="button button-scene" ng-click="$ctrl.addEvent('scene')">Layout</a>
				<a class="button button-comment" ng-click="$ctrl.addEvent('transcript')">Transcript</a>
				<a class="button button-comment" ng-click="$ctrl.addEvent('annotation')">Annotation</a>
				<a class="button button-link" ng-click="$ctrl.addEvent('link')">Link</a>
				<a class="button button-image" ng-click="$ctrl.addEvent('image')">Image</a>
				<a
				  class="button button-file"
				  ng-click="$ctrl.addEvent('file')"
				  ng-if="$ctrl.userHasRole('admin') || $ctrl.userHasRole('customer admin')">File</a>
				<a class="button button-question" ng-click="$ctrl.addEvent('question')">Question</a>
				<a class="button button-chapter" ng-click="$ctrl.addEvent('chapter')">Chapter</a>
			</span>
		</span>
		<span ng-if="!$ctrl.expanded">
			<a class="button button-add" ng-click="$ctrl.expand()">Add</a>
		</span>
	</div>
</div>

`;

interface IAddContentBindings extends ng.IComponentController {
  item: IEvent;
}

class AddContentController implements IAddContentBindings {
  item: IEvent;
  //
  expanded: boolean;
  static $inject = ['appState', 'playbackService', 'episodeEdit', 'authSvc'];
  constructor(public appState, public playbackService, public episodeEdit: IEpisodeEditService, public authSvc) {
    //
  }

  get renderAddLayoutButton() {
    return this.playbackService.getMetaProp('time') > 0
      && this.playbackService.getMetaProp('time') < (this.playbackService.getMetaProp('duration') - 0.1)
      && this.appState.viewMode === 'discover';
  }

  get showAddEventButton() {
    return !this.item
      && this.playbackService.getMetaProp('time') > 0
      && this.playbackService.getMetaProp('time') < (this.playbackService.getMetaProp('duration') - 0.1);
  }

  userHasRole(role: string) {
    return this.authSvc.userHasRole(role);
  }

  expand() {
    this.expanded = true;
    angular.element(document).one('mouseup.addcontent', () => {
      this.collapse();
    });
  }

  collapse() {
    this.expanded = false;
  }

  editEpisode() {
    this.episodeEdit.setEpisodeToEdit();
  }

  addEvent(producerItemType: string) {
    this.episodeEdit.addEvent(producerItemType);
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class AddContent implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = AddContentController;
  static Name: string = 'npAddContent'; // tslint:disable-line
}
