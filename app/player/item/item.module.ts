import ittItem from './components/ittItem';
import ItemController from './components/ItemController';
import ittItemEditor from './components/item-editor/ittItemEditor';
import ittItemDetailModal from './components/item-detail-modal/ittItemDetailModal';
import ittIframe from './components/iframe/ittIframe';
import { FileTemplate } from './templates/file/file.template';
import { HeaderOneTemplate } from './templates/header-one/header-one.template';
import { HeaderTwoTemplate } from './templates/header-two/header-two.template';
import { ImageTemplate } from './templates/image/image.template';
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
import {
  TranscriptWiththumbnailTemplate
} from './templates/transcript-withthumbnail/transcript-withthumbnail.template';
import { SearchresultsAllTemplate } from './templates/searchresults-all/searchresults-all.template';

const npItemModule = angular.module('np.item', []);

const templateDirectives = [
  FileTemplate,
  HeaderOneTemplate,
  HeaderTwoTemplate,
  ImageTemplate,
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
  TranscriptWiththumbnailTemplate,
  SearchresultsAllTemplate
];

export const tmpItemMap = {
  'templates/item/file.html':'file',
  'templates/item/text-h1.html':'header-one',
  'templates/item/text-h2.html':'header-two',
  'templates/item/image-plain.html':'image-plain',
  'templates/item/image-caption-sliding.html':'image-caption-sliding',
  'templates/item/image-thumbnail.html':'image-thumbnail',
  'templates/item/image-fill.html':'image-fill',
  'templates/item/image-inline-withtext.html':'image-inline-withtext',
  'templates/item/link.html':'link',
  'templates/item/link-descriptionfirst.html':'link-descriptionfirst',
  'templates/item/link-embed.html':'link-embed',
  'templates/item/link-modal-thumb.html':'link-modal-thumb',
  'templates/item/link-withimage-notitle.html':'link-withimage-notitle',
  'templates/item/pullquote.html':'pullquote',
  'templates/item/question-mc.html':'question-mc',
  'templates/item/sxs-annotation.html':'sxs-annotation',
  'templates/item/sxs-file.html':'sxs-file',
  'templates/item/sxs-image.html':'sxs-image',
  'templates/item/sxs-link.html':'sxs-link',
  'templates/item/sxs-question.html':'sxs-question',
  'templates/item/sxs-video.html':'sxs-video',
  'templates/item/text-definition.html':'text-definition',
  'templates/item/text-transmedia.html':'text-transmedia',
  'templates/item/transcript.html':'transcript',
  'templates/item/searchresults-all.html': 'searchresults-all'
};

npItemModule
  .directive('ittItem', ittItem)
  .controller('ItemController', ItemController)
  .directive('ittItemEditor', ittItemEditor)
  .directive('ittItemDetailModal', ittItemDetailModal)
  .directive('ittIframe', ittIframe);

templateDirectives.forEach((tmpDir: any) => {
  npItemModule.directive(tmpDir.Name, tmpDir.factory());
});

// services.forEach((svc: any) => {
//   itemModule.service(svc.Name, svc);
// });

export default npItemModule;
