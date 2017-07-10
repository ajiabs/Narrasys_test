/**
 * Created by githop on 6/14/17.
 */



//const / type pattern
export const SOCIAL_IMAGE_SQUARE: string = 'social_image_square';
export type SOCIAL_IMAGE_SQUARE = typeof SOCIAL_IMAGE_SQUARE;

export const SOCIAL_IMAGE_WIDE: string = 'social_image_wide';
export type SOCIAL_IMAGE_WIDE = typeof SOCIAL_IMAGE_WIDE;

export type TSocialTagTypes = SOCIAL_IMAGE_WIDE | SOCIAL_IMAGE_SQUARE;
