import ittItem from './components/ittItem';
import ItemController from './components/ItemController';
import { ItemEditor } from './components/item-editor/ittItemEditor';
import ittItemDetailModal from './components/item-detail-modal/ittItemDetailModal';
import ittIframe from './components/iframe/ittIframe';
import { FileTemplate } from './templates/file/file.template';
import { HeaderOneTemplate } from './templates/header-one/header-one.template';
import { HeaderTwoTemplate } from './templates/header-two/header-two.template';
import { ImageThumbnailTemplate } from './templates/image-thumbnail/image-thumbnail.template';
import { ImageCaptionSlidingTemplate } from './templates/image-caption-sliding/image-caption-sliding.template';
import { ImageFillTemplate } from './templates/image-fill/image-fill.template';
import { ImageInlineWithtextTemplate } from './templates/image-inline-withtext/image-inline-withtext.template';
import { ImagePlainTemplate } from './templates/image-plain/image-plain.template';
import { LinkTemplate } from './templates/link/link.template';
import { LinkDescriptionfirstTemplate } from './templates/link-description-first/link-descriptionfirst.template';
import { LinkEmbedTemplate } from './templates/link-embed/link-embed.template';
import { LinkModalThumbTemplate } from './templates/link-modal-thumb/link-modal-thumb.template';
import { LinkWithimageNotitleTemplate } from './templates/link-withimage-notitle/link-withimage-notitle.template';
import { PullquoteTemplate } from './templates/pullquote/pullquote.template';
import { QuestionMcTemplate } from './templates/question-mc/question-mc.template';
import { SxsAnnotationTemplate } from './templates/sxs-annotation/sxs-annotation.template';
import { SxsFileTemplate } from './templates/sxs-file/sxs-file.template';
import { SxsImageTemplate } from './templates/sxs-image/sxs-image.template';
import { SxsLinkTemplate } from './templates/sxs-link/sxs-link.template';
import { SxsQuestionTemplate } from './templates/sxs-question/sxs-question.template';
import { SxsVideoTemplate } from './templates/sxs-video/sxs-video.template';
import { TextDefinitionTemplate } from './templates/text-definition/text-definition.template';
import { TextTransmediaTemplate } from './templates/text-transmedia/text-transmedia.template';
import { TranscriptTemplate } from './templates/transcript/transcript.template';
import { SearchresultsAllTemplate } from './templates/searchresults-all/searchresults-all.template';
import { UscBadgesTemplate } from './templates/usc-badges/usc-badges.template';
import { UscBadgesInnerTemplate } from './templates/usc-badges-inner/usc-badges-inner.template';
import { CaptionTemplate } from './templates/caption/caption.template';

const npItemModule = angular.module('np.item', []);

const templateDirectives = [
  FileTemplate,
  HeaderOneTemplate,
  HeaderTwoTemplate,
  ImageCaptionSlidingTemplate,
  ImageFillTemplate,
  ImageInlineWithtextTemplate,
  ImagePlainTemplate,
  ImageThumbnailTemplate,
  LinkTemplate,
  LinkDescriptionfirstTemplate,
  LinkEmbedTemplate,
  LinkModalThumbTemplate,
  LinkWithimageNotitleTemplate,
  PullquoteTemplate,
  QuestionMcTemplate,
  SxsAnnotationTemplate,
  SxsFileTemplate,
  SxsImageTemplate,
  SxsLinkTemplate,
  SxsQuestionTemplate,
  SxsVideoTemplate,
  TextDefinitionTemplate,
  TextTransmediaTemplate,
  TranscriptTemplate,
  SearchresultsAllTemplate,
  UscBadgesTemplate,
  UscBadgesInnerTemplate,
  CaptionTemplate
];

npItemModule
  .directive('ittItem', ittItem)
  .controller('ItemController', ItemController)
  .component(ItemEditor.Name, new ItemEditor())
  .directive('ittItemDetailModal', ittItemDetailModal)
  .directive('ittIframe', ittIframe);

templateDirectives.forEach((tmpDir: any) => {
  npItemModule.directive(tmpDir.Name, tmpDir.factory());
});

export default npItemModule;
