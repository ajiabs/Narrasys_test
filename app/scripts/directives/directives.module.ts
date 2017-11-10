/**
 * Created by githop on 3/30/17.
 */

import { Clipboard } from './ittClipboard';
import ittFlotr2Chart from '../../question/components/ittFlotChart';
import { GuestAccessibleUrl } from './guest-accessible-url/npGuestAccessibleUrl';
import { NarrativeDetail } from './npNarrativeDetail';
import { NarrativeEditor } from './npNarrativeEditor';
import { NarrativeList } from './npNarrativeList';
import { NarrativesContainer } from './npNarrativesContainer';
import { NarrativeContainer } from './npNarrativeContainer';
import ittReviewMode from './ittReviewMode';
import ittTimeline from './ittTimeline';
import { TimelineEditor } from './npTimelineEditor';
import { EnableSocialshare, IttSocialShare } from './socialshare/index';
import { Filedrop } from './ittFiledrop';
import { UploadProgress } from './ittUploadProgress';

const directivesModule = angular.module('itt.directives', [])
  .component(Clipboard.Name, new Clipboard())
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .component(GuestAccessibleUrl.Name, new GuestAccessibleUrl())
  .component(NarrativeEditor.Name, new NarrativeEditor())
  .component(NarrativeList.Name, new NarrativeList())
  .directive('ittReviewMode', ittReviewMode)
  .directive('ittTimeline', ittTimeline)
  .component(TimelineEditor.Name, new TimelineEditor())
  .component(IttSocialShare.Name, new IttSocialShare())
  .component(EnableSocialshare.Name, new EnableSocialshare())
  .component(Filedrop.Name, new Filedrop())
  .component(UploadProgress.Name, new UploadProgress())
  .component(NarrativeDetail.Name, new NarrativeDetail())
  .component(NarrativeContainer.Name, new NarrativeContainer())
  .component(NarrativesContainer.Name, new NarrativesContainer());

export default directivesModule;
