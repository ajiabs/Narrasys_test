/**
 * Created by githop on 6/14/17.
 */



//const / type pattern
export const SOCIAL_IMAGE_SQUARE = 'social_image_square';
export type SOCIAL_IMAGE_SQUARE = typeof SOCIAL_IMAGE_SQUARE;

export const SOCIAL_IMAGE_WIDE = 'social_image_wide';
export type SOCIAL_IMAGE_WIDE =  typeof SOCIAL_IMAGE_WIDE;

export type TSocialTagTypes = SOCIAL_IMAGE_WIDE | SOCIAL_IMAGE_SQUARE;

export const CHANGE_MAGNET = 'magnet.changeMagnet';
export type CHANGE_MAGNET = typeof CHANGE_MAGNET;

export const JUMP_TO_MAGNET = 'magnet.jumpToMagnet';
export type JUMP_TO_MAGNET = typeof JUMP_TO_MAGNET;

export const UPDATE_MAGNET = 'magnet.updateMagnet';
export type UPDATE_MAGNET = typeof UPDATE_MAGNET;
