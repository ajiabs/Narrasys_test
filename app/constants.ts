/**
 * Created by githop on 6/14/17.
 */
import { capitalize } from './shared/services/ittUtils';

//const / type pattern
export const SOCIAL_IMAGE_SQUARE: string = 'social_image_square';
export type SOCIAL_IMAGE_SQUARE = 'social_image_square';

export const SOCIAL_IMAGE_WIDE: string = 'social_image_wide';
export type SOCIAL_IMAGE_WIDE =  'social_image_wide';

export type TSocialTagTypes = SOCIAL_IMAGE_WIDE | SOCIAL_IMAGE_SQUARE;

export const CHANGE_MAGNET: string = 'magnet.changeMagnet';
export type CHANGE_MAGNET = 'magnet.changeMagnet';

export const JUMP_TO_MAGNET: string = 'magnet.jumpToMagnet';
export type JUMP_TO_MAGNET = 'magnet.jumpToMagnet';

export const UPDATE_MAGNET: string = 'magnet.updateMagnet';
export type UPDATE_MAGNET = 'magnet.updateMagnet';

type TMimeKeys = 'assetLib' | 'file' | 'default' | 'transcripts';
type TMimes = {
  readonly [key in TMimeKeys]: string;
};

/* tslint:disable */
export const MIMES: TMimes = {
  'assetLib': 'image/*,text/plain,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf',
  'file': 'text/plain,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf',
  'default': 'image/*',
  'transcripts': 'text/vtt,text/srt'
};
/* tslint:enable */

export namespace EventTemplates {
  export const LANDINGSCREEN_TEMPLATE = 'layout-landingscreen';
  export type LANDINGSCREEN_TEMPLATE = typeof LANDINGSCREEN_TEMPLATE;

  export const ENDINGSCREEN_TEMPLATE = 'layout-endingscreen';
  export type ENDINGSCREEN_TEMPLATE = typeof ENDINGSCREEN_TEMPLATE;

  export const CENTERED_TEMPLATE = 'layout-centered';
  export type CENTERED_TEMPLATE = typeof CENTERED_TEMPLATE;

  export const ONECOL_TEMPLATE = 'layout-onecol';
  export type ONECOL_TEMPLATE = typeof ONECOL_TEMPLATE;

  export const CORNER_H_TEMPLATE = 'layout-corner-h';
  export type CORNER_H_TEMPLATE = typeof CORNER_H_TEMPLATE;

  export const CORNER_V_TEMPLATE = 'layout-corner-v';
  export type CORNER_V_TEMPLATE = typeof CORNER_V_TEMPLATE;

  export const PIP_TEMPLATE = 'layout-pip';
  export type PIP_TEMPLATE = typeof PIP_TEMPLATE;

  export const MIRRORED_TWOCOL_TEMPLATE = 'layout-mirrored-twocol';
  export type MIRRORED_TWOCOL_TEMPLATE = typeof MIRRORED_TWOCOL_TEMPLATE;

  export const CENTERED_PRO_TEMPLATE = 'layout-centered-pro';
  export type CENTERED_PRO_TEMPLATE = typeof CENTERED_PRO_TEMPLATE;

  export const CENTER_VV_TEMPLATE = 'layout-center-vv';
  export type CENTER_VV_TEMPLATE = typeof CENTER_VV_TEMPLATE;

  export const CENTER_VV_MONDRIAN_TEMPLATE = 'layout-center-vv-mondrian';
  export type CENTER_VV_MONDRIAN_TEMPLATE = typeof CENTER_VV_MONDRIAN_TEMPLATE;

  export const FILE_TEMPLATE = 'item-file';
  export type FILE_TEMPLATE = typeof FILE_TEMPLATE;

  export const IMAGE_THUMBNAIL_TEMPLATE = 'item-image-thumbnail'; // DUPLICATE!
  export type IMAGE_THUMBNAIL_TEMPLATE = typeof IMAGE_THUMBNAIL_TEMPLATE;

  export const SLIDING_CAPTION = 'item-image-caption-sliding';
  export type SLIDING_CAPTION = typeof SLIDING_CAPTION;

  export const IMAGE_FILL_TEMPLATE = 'item-image-fill';
  export type IMAGE_FILL_TEMPLATE = typeof IMAGE_FILL_TEMPLATE;

  export const IMAGE_INLINE_WITHTEXT_TEMPLATE = 'item-image-inline-withtext';
  export type IMAGE_INLINE_WITHTEXT_TEMPLATE = typeof IMAGE_INLINE_WITHTEXT_TEMPLATE;

  export const IMAGE_PLAIN_TEMPLATE = 'item-image-plain';
  export type IMAGE_PLAIN_TEMPLATE = typeof IMAGE_PLAIN_TEMPLATE;

  export const LINK_TEMPLATE = 'item-link';
  export type LINK_TEMPLATE = typeof LINK_TEMPLATE;

  export const LINK_DESCRIPTION_FIRST_TEMPLATE = 'item-link-descriptionfirst';
  export type LINK_DESCRIPTION_FIRST_TEMPLATE = typeof LINK_DESCRIPTION_FIRST_TEMPLATE;

  export const LINK_EMBED_TEMPLATE = 'item-link-embed';
  export type LINK_EMBED_TEMPLATE = typeof LINK_EMBED_TEMPLATE;

  export const LINK_MODAL_THUMB_TEMPLATE = 'item-link-modal-thumb';
  export type LINK_MODAL_THUMB_TEMPLATE = typeof LINK_MODAL_THUMB_TEMPLATE;

  export const LINK_WITHIMAGE_NOTITLE_TEMPLATE = 'item-link-withimage-notitle';
  export type LINK_WITHIMAGE_NOTITLE_TEMPLATE = typeof LINK_WITHIMAGE_NOTITLE_TEMPLATE;

  export const PULLQUOTE_TEMPLATE = 'item-pullquote';
  export type PULLQUOTE_TEMPLATE = typeof PULLQUOTE_TEMPLATE;

  export const QUESTION_TEMPLATE = 'item-question-mc';
  export type QUESTION_TEMPLATE = typeof QUESTION_TEMPLATE;

  export const SXS_ANNOTAITON_TEMPLATE = 'item-sxs-annotation';
  export type SXS_ANNOTAITON_TEMPLATE = typeof SXS_ANNOTAITON_TEMPLATE;

  export const SXS_FILE_TEMPLATE = 'item-sxs-file';
  export type SXS_FILE_TEMPLATE = typeof SXS_FILE_TEMPLATE;

  export const SXS_LINK_TEMPLATE = 'item-sxs-link';
  export type SXS_LINK_TEMPLATE = typeof SXS_LINK_TEMPLATE;

  export const SXS_QUESTION_TEMPLATE = 'item-sxs-question';
  export type SXS_QUESTION_TEMPLATE = typeof SXS_QUESTION_TEMPLATE;

  export const SXS_VIDEO_TEMPLATE = 'item-sxs-video';
  export type SXS_VIDEO_TEMPLATE = typeof SXS_VIDEO_TEMPLATE;

  export const SXS_IMAGE_TEMPLATE = 'item-sxs-image';
  export type SXS_IMAGE_TEMPLATE = typeof SXS_IMAGE_TEMPLATE;

  export const TEXT_DEFINITION_TEMPLATE = 'item-text-definition';
  export type TEXT_DEFINITION_TEMPLATE = typeof TEXT_DEFINITION_TEMPLATE;

  export const TEXT_TRANSMEDIA_TEMPLATE = 'item-text-transmedia'; // DUPLICATE!
  export type TEXT_TRANSMEDIA_TEMPLATE = typeof TEXT_TRANSMEDIA_TEMPLATE;

  export const HEADER_ONE_TEMPLATE = 'item-header-one';
  export type HEADER_ONE_TEMPLATE = typeof HEADER_ONE_TEMPLATE;

  export const HEADER_TWO_TEMPLATE = 'item-header-two';
  export type HEADER_TWO_TEMPLATE = typeof HEADER_TWO_TEMPLATE;

  export const TRANSCRIPT_TEMPLATE = 'item-transcript';
  export type TRANSCRIPT_TEMPLATE = typeof TRANSCRIPT_TEMPLATE;

  // export const TRANSCRIPT_WITHTHUMBNAIL_TEMPLATE = 'Default'; // DUPLICATE!
  // export type TRANSCRIPT_WITHTHUMBNAIL_TEMPLATE = typeof TRANSCRIPT_WITHTHUMBNAIL_TEMPLATE;

  export const USC_BADGES_TEMPLATE = 'item-usc-badges';
  export type USC_BADGES_TEMPLATE = typeof USC_BADGES_TEMPLATE;

  export const USC_BADGES_INNER_TEMPLATE = 'item-usc-badges-inner';
  export type USC_BADGES_INNER_TEMPLATE = typeof USC_BADGES_INNER_TEMPLATE;
}

export type TFileItemNames = EventTemplates.FILE_TEMPLATE;

export type TImageItemNames = EventTemplates.IMAGE_THUMBNAIL_TEMPLATE
| EventTemplates.SLIDING_CAPTION
| EventTemplates.IMAGE_FILL_TEMPLATE
| EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE
| EventTemplates.IMAGE_PLAIN_TEMPLATE;

export type TLinkItemNames = EventTemplates.LINK_TEMPLATE
| EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE
| EventTemplates.LINK_EMBED_TEMPLATE
| EventTemplates.LINK_MODAL_THUMB_TEMPLATE
| EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE;

export type TPullquoteItemNames = EventTemplates.PULLQUOTE_TEMPLATE;

export type TQuestionItemNames = EventTemplates.QUESTION_TEMPLATE | EventTemplates.SXS_QUESTION_TEMPLATE;

export type TSxsItemNames = EventTemplates.SXS_QUESTION_TEMPLATE
| EventTemplates.SXS_ANNOTAITON_TEMPLATE
| EventTemplates.SXS_FILE_TEMPLATE
| EventTemplates.SXS_LINK_TEMPLATE
| EventTemplates.SXS_IMAGE_TEMPLATE
| EventTemplates.SXS_VIDEO_TEMPLATE;

export type TTextDefItemNames = EventTemplates.TEXT_DEFINITION_TEMPLATE;
export type TTextTransItemNames = EventTemplates.TEXT_TRANSMEDIA_TEMPLATE;
export type THeaderItemNames = EventTemplates.HEADER_TWO_TEMPLATE | EventTemplates.HEADER_ONE_TEMPLATE;

export type TAnnotationItemNames = TPullquoteItemNames
  | TTextDefItemNames
  | TTextTransItemNames
  | THeaderItemNames
  | EventTemplates.TRANSCRIPT_TEMPLATE;

export type TLayoutNames = EventTemplates.LANDINGSCREEN_TEMPLATE
| EventTemplates.ENDINGSCREEN_TEMPLATE
| EventTemplates.CENTERED_TEMPLATE
| EventTemplates.ONECOL_TEMPLATE
| EventTemplates.CORNER_H_TEMPLATE
| EventTemplates.CORNER_V_TEMPLATE
| EventTemplates.PIP_TEMPLATE
| EventTemplates.MIRRORED_TWOCOL_TEMPLATE
| EventTemplates.CENTERED_PRO_TEMPLATE
| EventTemplates.CENTER_VV_TEMPLATE
| EventTemplates.CENTER_VV_MONDRIAN_TEMPLATE;

export type TEventTemplateNames = EventTemplates.USC_BADGES_TEMPLATE
| TFileItemNames
| TImageItemNames
| TLinkItemNames
| TPullquoteItemNames
| TQuestionItemNames
| TSxsItemNames
| TTextDefItemNames
| TTextTransItemNames
| THeaderItemNames
| TAnnotationItemNames
| TLayoutNames;

export function componentTemplateNameify(cmp: TEventTemplateNames | EventTemplates.USC_BADGES_INNER_TEMPLATE): string {
  const componentName = cmp
    .split('-')
    .map(word => capitalize(word))
    .join('');

  return `np${componentName}Template`;
}
