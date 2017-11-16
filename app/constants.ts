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

export namespace EventTemplates {

  export const LANDINGSCREEN_TEMPLATE = 'landingscreen';
  export type LANDINGSCREEN_TEMPLATE = typeof LANDINGSCREEN_TEMPLATE;

  export const ENDINGSCREEN_TEMPLATE = 'endingscreen';
  export type ENDINGSCREEN_TEMPLATE = typeof ENDINGSCREEN_TEMPLATE;

  export const CENTERED_TEMPLATE = 'centered';
  export type CENTERED_TEMPLATE = typeof CENTERED_TEMPLATE;

  export const ONECOL_TEMPLATE = 'onecol';
  export type ONECOL_TEMPLATE = typeof ONECOL_TEMPLATE;

  export const CORNER_H_TEMPLATE = 'corner-h';
  export type CORNER_H_TEMPLATE = typeof CORNER_H_TEMPLATE;

  export const CORNER_V_TEMPLATE = 'corner-v';
  export type CORNER_V_TEMPLATE = typeof CORNER_V_TEMPLATE;

  export const PIP_TEMPLATE = 'pip';
  export type PIP_TEMPLATE = typeof PIP_TEMPLATE;

  export const MIRRORED_TWOCOL_TEMPLATE = 'mirrored-twocol';
  export type MIRRORED_TWOCOL_TEMPLATE = typeof MIRRORED_TWOCOL_TEMPLATE;

  export const CENTERED_PRO_TEMPLATE = 'centered-pro';
  export type CENTERED_PRO_TEMPLATE = typeof CENTERED_PRO_TEMPLATE;

  export const CENTER_VV_TEMPLATE = 'center-vv';
  export type CENTER_VV_TEMPLATE = typeof CENTER_VV_TEMPLATE;

  export const CENTER_VV_MONDRIAN_TEMPLATE = 'center-vv-mondrian';
  export type CENTER_VV_MONDRIAN_TEMPLATE = typeof CENTER_VV_MONDRIAN_TEMPLATE;

  export const FILE_TEMPLATE = 'file';
  export type FILE_TEMPLATE = typeof FILE_TEMPLATE;

// export const IMAGE_TEMPLATE = 'Thumbnail';
// export type IMAGE_TEMPLATE = typeof IMAGE_TEMPLATE;

  export const IMAGE_THUMBNAIL_TEMPLATE = 'image-thumbnail'; // DUPLICATE!
  export type IMAGE_THUMBNAIL_TEMPLATE = typeof IMAGE_THUMBNAIL_TEMPLATE;

  export const SLIDING_CAPTION = 'image-caption-sliding';
  export type SLIDING_CAPTION = typeof SLIDING_CAPTION;

  export const IMAGE_FILL_TEMPLATE = 'image-fill';
  export type IMAGE_FILL_TEMPLATE = typeof IMAGE_FILL_TEMPLATE;

  export const IMAGE_INLINE_WITHTEXT_TEMPLATE = 'image-inline-withtext';
  export type IMAGE_INLINE_WITHTEXT_TEMPLATE = typeof IMAGE_INLINE_WITHTEXT_TEMPLATE;

  export const IMAGE_PLAIN_TEMPLATE = 'image-plain';
  export type IMAGE_PLAIN_TEMPLATE = typeof IMAGE_PLAIN_TEMPLATE;

  export const LINK_TEMPLATE = 'link';
  export type LINK_TEMPLATE = typeof LINK_TEMPLATE;

  export const LINK_DESCRIPTION_FIRST_TEMPLATE = 'link-descriptionfirst';
  export type LINK_DESCRIPTION_FIRST_TEMPLATE = typeof LINK_DESCRIPTION_FIRST_TEMPLATE;

  export const LINK_EMBED_TEMPLATE = 'link-embed';
  export type LINK_EMBED_TEMPLATE = typeof LINK_EMBED_TEMPLATE;

  export const LINK_MODAL_THUMB_TEMPLATE = 'link-modal-thumb';
  export type LINK_MODAL_THUMB_TEMPLATE = typeof LINK_MODAL_THUMB_TEMPLATE;

  export const LINK_WITHIMAGE_NOTITLE_TEMPLATE = 'link-withimage-notitle';
  export type LINK_WITHIMAGE_NOTITLE_TEMPLATE = typeof LINK_WITHIMAGE_NOTITLE_TEMPLATE;

  export const PULLQUOTE_TEMPLATE = 'pull-quote';
  export type PULLQUOTE_TEMPLATE = typeof PULLQUOTE_TEMPLATE;

  export const QUESTION_TEMPLATE = 'question-mc';
  export type QUESTION_TEMPLATE = typeof QUESTION_TEMPLATE;

  export const SXS_ANNOTAITON_TEMPLATE = 'sxs-annotation';
  export type SXS_ANNOTAITON_TEMPLATE = typeof SXS_ANNOTAITON_TEMPLATE;

  export const SXS_FILE_TEMPLATE = 'sxs-file';
  export type SXS_FILE_TEMPLATE = typeof SXS_FILE_TEMPLATE;

  export const SXS_LINK_TEMPLATE = 'sxs-link';
  export type SXS_LINK_TEMPLATE = typeof SXS_LINK_TEMPLATE;

  export const SXS_QUESTION_TEMPLATE = 'sxs-question';
  export type SXS_QUESTION_TEMPLATE = typeof SXS_QUESTION_TEMPLATE;

  export const SXS_VIDEO_TEMPLATE = 'sxs-video';
  export type SXS_VIDEO_TEMPLATE = typeof SXS_VIDEO_TEMPLATE;

  export const TEXT_DEFINITION_TEMPLATE = 'text-definition';
  export type TEXT_DEFINITION_TEMPLATE = typeof TEXT_DEFINITION_TEMPLATE;

  export const TEXT_TRANSMEDIA_TEMPLATE = 'text-transmedia'; // DUPLICATE!
  export type TEXT_TRANSMEDIA_TEMPLATE = typeof TEXT_TRANSMEDIA_TEMPLATE;

  export const HEADER_ONE_TEMPLATE = 'header-one';
  export type HEADER_ONE_TEMPLATE = typeof HEADER_ONE_TEMPLATE;

  export const HEADER_TWO_TEMPLATE = 'header-two';
  export type HEADER_TWO_TEMPLATE = typeof HEADER_TWO_TEMPLATE;

  export const TRANSCRIPT_TEMPLATE = 'transcript';
  export type TRANSCRIPT_TEMPLATE = typeof TRANSCRIPT_TEMPLATE;

  // export const TRANSCRIPT_WITHTHUMBNAIL_TEMPLATE = 'Default'; // DUPLICATE!
  // export type TRANSCRIPT_WITHTHUMBNAIL_TEMPLATE = typeof TRANSCRIPT_WITHTHUMBNAIL_TEMPLATE;

  export const USC_BADGES_TEMPLATE = 'usc-badges';
  export type USC_BADGES_TEMPLATE = typeof USC_BADGES_TEMPLATE;

  export const USC_BADGES_INNER_TEMPLATE = 'usc-badges-inner';
  export type USC_BADGES_INNER_TEMPLATE = typeof USC_BADGES_INNER_TEMPLATE;
}

export function componentTemplateNameify(cmp) {
  const componentName = cmp
    .split('-')
    .map(word => capitalize(word))
    .join('');

  return `np${componentName}Template`;
}
