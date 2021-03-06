// @npUpgrade-stories-true
/*

 TODO:
 split this file up into separate directive files
 when displaying a narrative, compare its user_id to the current user's id to set isOwner
 i18n

 To create a narrative:
 * get the user ID, make a group containing that ID,
 * create narrative with name,description,group id

 TO add a timeline:
 * user chooses a parent episode

 * create timeline with name,description,hidden,path, sort_order
 * make a child episode of parent episode
 * make an episode segment (needs timeline id, start, end, child episode id, sort_order)

 * then reload narrative/resolve

 (resolve should sort timelines and segments, API won't necessarily handle this for us)

 to update narrative or timeline: just send the basic fields, not the fully-resolved data.


 */
import { createInstance, IAsset, ICustomer, IEpisode, INarrative, ITempTimeline, ITimeline } from '../../../models';
import { IDataSvc, IModelSvc } from '../../../interfaces';
import { bitwiseCeil, existy, stripHtmlTags } from '../../../shared/services/ittUtils';

import defaultHtml from './default.html';

interface INarrativeDetailBindings extends ng.IComponentController {
  narrative: INarrative;
  customers: ICustomer[];
}

class NarrativeDetailController implements INarrativeDetailBindings {
  narrative: INarrative;
  customers: ICustomer[];
  isOwner: boolean;
  user: any;
  canAccess: boolean;
  editingNarrative: boolean;
  timelineUnderEdit: ITimeline;
  tmpTimeline: ITimeline;
  showEpisodeList: boolean;
  totalNarrativeDuration: number;
  treeOpts = {
    accept: (/*sourceNodeScope, destNodesScope, destIndex*/) => true,
    dropped: (event) => {
      const destIndex = event.dest.index;
      const srcIndex = event.source.index;
      if (destIndex !== srcIndex) {
        this.narrative.timelines = NarrativeDetailController._updateSortOrder(destIndex, this.narrative.timelines);
        this._persistTimelineSortUpdate(this.narrative.timelines[destIndex]);
      }

    }
  };
  static $inject = ['$routeParams', 'authSvc', 'appState', 'dataSvc', 'modelSvc'];
  constructor(
    private $routeParams,
    private authSvc,
    private appState,
    private dataSvc: IDataSvc,
    private modelSvc: IModelSvc) {
    //
  }

  $onInit() {
    this.isOwner = false;
    this.user = this.appState.user;
    if (this.authSvc.userHasRole('admin') || this.authSvc.userHasRole('customer admin')) {
      this.canAccess = true;
    }
    this._setTotalNarrativeDuration(this.narrative.timelines);
  }

  logout() {
    this.authSvc.logout();
  }

  toggleEditNarrativeModal($undo: INarrative) {
    const cachedNarratives = existy(this.customers[0]) &&
      existy(this.customers[0].narratives) &&
      this.customers[0].narratives.length > 1;
    //need list of other narratives to for validation of path slugs.
    if (!cachedNarratives) {
      this.dataSvc.getNarrativeList(this.customers[0])
        .then(() => {
          this.editingNarrative = !this.editingNarrative;
        });
    } else {
      this.editingNarrative = !this.editingNarrative;
    }

    if ($undo != null) {
      this.narrative = $undo;
    }
  }

  toggleEditingTimeline(tl: ITimeline) {
    this.timelineUnderEdit = tl;
  }

  doneEditingTimeline() {
    this.timelineUnderEdit = null;
    //remove tmp tl from timelines;
    this.narrative.timelines = this.narrative.timelines.filter((tl: ITimeline) => {
      return tl !== this.tmpTimeline;
    });
    this.tmpTimeline = null;
  }

  toggleOwnership() {
    this.isOwner = !this.isOwner;
  }

  toggleEpisodeList() {
    this.showEpisodeList = !this.showEpisodeList;
  }

  updateNarrative(update) {
    this.dataSvc.updateNarrative(update).then((resp: {data: INarrative}) => {
      this.editingNarrative = false;
      //updateNarrative returns just the new narrative object, without timelines array
      //merge the existing narrative on scope with the one returned via our post resp.
      angular.extend(this.narrative, resp.data);
      const cust = this.modelSvc.customers[resp.data.customer_id];
      this.modelSvc.assocNarrativesWithCustomer(cust, [resp.data]);
    });
  }

  updateTimeline(newTimeline: ITimeline, oldTimeline: ITimeline) {
    this.dataSvc.storeTimeline(this.narrative._id, newTimeline).then((resp) => {
      angular.extend(oldTimeline, resp);
      this.doneEditingTimeline();
    });
  }

  addTmpTimeline(currTl: ITimeline, timelines: ITimeline[]) {
    let currSortOrder;
    let fromTl;
    let nextTlSortOrder;
    let currIndex;
    let newIndex;

    if (!existy(currTl)) {
      currSortOrder = 0;
      newIndex = 0;
    } else {
      currIndex = timelines.indexOf(currTl);
      newIndex = currIndex + 1;
      fromTl = timelines[currIndex];
      currSortOrder = fromTl.sort_order;
      if (timelines.slice(-1)[0] === fromTl) {
        currSortOrder += 100;
      } else {
        nextTlSortOrder = timelines[currIndex + 1].sort_order;
        currSortOrder = bitwiseCeil((nextTlSortOrder + currSortOrder) / 2);
      }

    }
    // ok to use createInstance outside of modelSvc#cache here
    // because we do not have a case for 'timelines' in modelSvc#cache
    const newTimeline = createInstance<ITimeline>('Timeline', {
      name: { en: '' },
      description: { en: '' },
      hidden: false,
      sort_order: currSortOrder,
      isTemp: true,
      index: newIndex
    });
    //favor slice over splice as splice mutates array in place.
    const head = timelines.slice(0, newIndex);
    const tail = timelines.slice(newIndex, timelines.length);
    head.push(newTimeline);
    this.narrative.timelines = head.concat(tail);
    this.tmpTimeline = newTimeline;
    //to open episode select modal
    this.toggleEpisodeList();
  }

  onEpisodeSelect(epId: string) {
    //if tmpTimeline is not set, assume
    // this is the first timeline to create;
    this.dataSvc.getEpisodeOverview(epId).then((episodeData: IEpisode) => {
      this.tmpTimeline.parent_episode = episodeData;

      if (existy(episodeData.description)) {
        this.tmpTimeline.description.en = stripHtmlTags(episodeData.description.en);
      }

      this.tmpTimeline.name.en = stripHtmlTags(episodeData.title.en);
      return episodeData;
    }).then((episodeData) => {
      this.dataSvc.getSingleAsset(episodeData.master_asset_id).then((data: IAsset) => {
        if (data) {
          this.tmpTimeline.duration = data.duration;
        } else {
          this.tmpTimeline.duration = 0;
        }
        //to close episode select modal after select
        this.toggleEpisodeList();
        //to open the timeline editor modal
        this.persistTmpTimeline(this.tmpTimeline);
      });
    });
  }

  persistTmpTimeline(tl) {
    this.narrative.timelines = NarrativeDetailController._updateSortOrder(tl.index, this.narrative.timelines);

    const storeChildEpisode = (childEpisode) => {
      return this.dataSvc.storeTimeline(this.narrative._id, tl).then((tlData) => {
        return { d: tlData, e: childEpisode };
      });
    };

    const handleEpisodeSegment = (config: {d: ITempTimeline, e: IEpisode}) => {
      const tlData = config.d;
      const childEpisode = config.e;
      this.dataSvc.createEpisodeSegment(tlData._id, {
        episode_id: childEpisode._id,
        start_time: 0,
        end_time: tl.duration,
        sort_order: 0,
        timeline_id: tlData._id
      }).then((segmentData) => {
        tlData.episode_segments = [segmentData];
        angular.forEach(this.narrative.timelines, (tl: ITempTimeline | ITimeline) =>  {
          if (tl.sort_order === tlData.sort_order) {
            angular.extend(tl, tlData, { isTemp: false });
          }
        });
        this.tmpTimeline = null;
        this.doneEditingTimeline();
        this._setTotalNarrativeDuration(this.narrative.timelines);
      });
    };

    const logErr = (e: any) => console.log(e);

    this.dataSvc.createChildEpisode({
      parent_id: tl.parent_episode._id
    })
      .then(storeChildEpisode)
      .then(handleEpisodeSegment)
      .catch(logErr);

  }

  editorAction(newTl: ITempTimeline, currTl: ITimeline) {
    if (newTl.isTemp === true) {
      this.persistTmpTimeline(newTl);
    } else {
      this.updateTimeline(newTl, currTl);
    }
  }

  deleteTimeline(tl: ITimeline) {
    this.dataSvc.deleteTimeline(tl._id).then(() => {
      this.narrative.timelines = this.narrative.timelines.filter((t) => {
        return tl._id !== t._id;
      });
      this.doneEditingTimeline();
      this._setTotalNarrativeDuration(this.narrative.timelines);
    });
  }

  exportToSpreadsheet(nId: string) {
    this.dataSvc.getNarrativeExportAsSpreadsheet(nId);
  }

  private static _updateSortOrder(destIndex: number, _arr: ITimeline[]): ITimeline[] {
    const arr = [..._arr]; // copy to avoid mutation ;)
    const len = arr.length;
    let sortIndex = 0;
    if (destIndex > 0) {

      if (destIndex === len - 1) {
        sortIndex = arr[destIndex - 1].sort_order + 100;
      } else {
        sortIndex = bitwiseCeil((arr[destIndex - 1].sort_order + arr[destIndex + 1].sort_order) / 2);
      }

    }
    let prevSortIndex = sortIndex;
    arr[destIndex].sort_order = sortIndex;
    let _destIndex = destIndex + 1;
    sortIndex += 1;
    for (; _destIndex < len; _destIndex += 1) {
      if (prevSortIndex >= arr[_destIndex].sort_order) {
        arr[_destIndex].sort_order = sortIndex;
      }
      prevSortIndex = sortIndex;
      sortIndex += 1;
    }

    return arr;
  }

  private _setTotalNarrativeDuration(timelines: ITimeline[]): void {
    this.totalNarrativeDuration = timelines
      .map((tl: ITimeline) => tl.episode_segments.map((s: any) => s.end_time)[0])
      .reduce(
      (accm, durs) => accm + durs,
      0
    );
  }

  private _persistTimelineSortUpdate(timeline: ITimeline) {
    this.dataSvc.storeTimeline(this.narrative._id, timeline).then((resp) => {
      angular.extend(timeline, resp);
    });
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '&' | '@' | '=';
}
export class NarrativeDetail implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    narrative: '<',
    customers: '<'
  };
  template: string = defaultHtml;
  controller = NarrativeDetailController;
  static Name: string = 'npNarrativeDetail'; // tslint:disable-line
}




