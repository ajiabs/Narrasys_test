import { EnableSocialshare } from './components/enable-socialshare/ittEnableSocialshare';
import { GuestAccessibleUrl } from './components/guest-accessible-url/npGuestAccessibleUrl';
import { SocialShare } from './components/socialshare/ittSocialShare';
import { Clipboard } from './components/ittClipboard';
import { Filedrop } from './components/ittFiledrop';
import { UploadProgress } from './components/ittUploadProgress';
import { NarrativeContainer } from './components/npNarrativeContainer';
import { NarrativeDetail } from './components/narrative-detail/npNarrativeDetail';
import { NarrativeEditor } from './components/npNarrativeEditor';
import { NarrativeList } from './components/narrative-list/npNarrativeList';
import { NarrativesContainer } from './components/npNarrativesContainer';
import { TimelineEditor } from './components/npTimelineEditor';

const npStoriesModule = angular.module('np.stories', []);

const components = [
  EnableSocialshare,
  GuestAccessibleUrl,
  SocialShare,
  Clipboard,
  Filedrop,
  UploadProgress,
  NarrativeContainer,
  NarrativeDetail,
  NarrativeEditor,
  NarrativeList,
  NarrativesContainer,
  TimelineEditor
];

components.forEach((cmp: any) => {
  npStoriesModule.component(cmp.Name, new cmp());
});

export default npStoriesModule;
