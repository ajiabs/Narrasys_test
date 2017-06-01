import {ILangForm} from './interfaces';
/**
 * Created by githop on 5/1/17.
 */


export class INarrative {
  name: ILangForm;
  description: ILangForm;
  guest_access_allowed: boolean;
  authenticated_access_allowed: boolean;
  disable_navigation: boolean;
  disable_new_window: boolean;
  enable_social_sharing: boolean;
  path_slug: ILangForm;
  support_url: string;
  timelines: any[];
  timeline_image_ids: string[];
  narrative_image_ids: string[];
}

export class IAsset {
  _id: string;
  _type: string;
  status: string;
  upload: any;
  url: string;
  filename: string;
  original_filename: string;
  content_type: string;
  extension: string;
  size: number;
  name: ILangForm;
  description: ILangForm;
  tags: string[];
  episodes_count: number;
  episode_poster_frames_count: number;
  links_count: number;
  annotations_count: number;
  narratives_count: number;
  timelines_count: number;
  uploads_count: number;
  plugins_count: number;
  container_id: string;
  user_id: string;
}

export class IEvent {
  //props
  start_time: number;
  type: 'Annotation' | 'Bookmark' | 'File' | 'Image' | 'Link' | 'Plugin' | 'Scene' | 'Chapter' | 'Text' | 'Upload';
  end_time: number;
  title: ILangForm;
  description: ILangForm;
  cosmetic: boolean;
  stop: boolean;
//props not in any schema but added dynamically either on the backend somewhere client-side;
  avatar_id: string;
  templateOpts?: any[];
  //relations
  episode_id: string;
  user_id: string;
  template_id: string;
  layout_id: string;
  style_id: string;
  templateUrl?: string;
  //group ??
  //event_category ??
}

export class ILinkStatus {
  content_security_policy: string | null;
  x_frame_options: string | null;
  response_code: number;
  err: string;
  _id?: string;
  status?: string;
  location?: string;
  updated_at?: Date;
}

export class ILink extends IEvent {
  type: 'Link';
  _type: 'Link';
  target: '_blank' | '_self';
  url: string;
  display_title?: string;
  display_description?: string;
  styles?: string[];
  showInlineDetail?: boolean;
  //relations
  link_image_id: string;
  url_status?: ILinkStatus;

}

export class IAnnotation extends IEvent {
  type: 'Annotation';
  _type: 'Annotation';
  annotator: ILangForm;
  annotation: ILangForm;
  chapter_marker: boolean = false;
  //belongs_to annotation image;
  annotation_image_id: string;
}

export class IBookmark extends IEvent {
  type: 'Bookmark';
  _type: 'Bookmark';
}

export class IChapter extends IEvent {
  type: 'Chapter';
  _type: 'Chapter';
}

export class IImage extends IEvent {
  type: 'Image';
  _type: 'Image';
  templateUrl?: string;
}

class IPluginData {
  correctFeedback: ILangForm;
  distractors: { index: number, text: string }[];
  incorrectFeedback: ILangForm;
  questionText: ILangForm;
  questionType: string;
}

export class IPlugin extends IEvent {
  type: 'Plugin';
  _type: 'Plugin';
  data: {
    _id: string,
    _pluginType: string,
    _version: number
    _plugin: IPluginData;
  };
}

export class IScene extends IEvent {
  type: 'Scene';
  _type: 'Scene';
}

export class IText extends IEvent {
  type: 'Text';
  _type: 'Text';
}

export class IUpload extends IEvent {
  type: 'Upload';
  _type: 'Upload';
  asset_id: string;
}

export function createInstance(type: string, data: any) {
  let model;
  switch (type) {
    case 'Link':
      model = new ILink();
      break;
    case 'Annotation':
      model = new IAnnotation();
      break;
    case 'Bookmark':
      model = new IBookmark();
      break;
    case 'Chapter':
      model = new IChapter();
      break;
    case 'Image':
      model = new IImage();
      break;
    case 'Plugin':
      model = new IPlugin();
      break;
    case 'Scene':
      model = new IScene();
      break;
    case 'Text':
      model = new IText();
      break;
    case 'Upload':
      model = new IUpload();
      break;
    case 'Narrative':
      model = new INarrative();
      break;
    case 'Asset':
      model = new IAsset();
      break;
  }
  Object.assign(model, data);
  return model;
}

//union type to provide type checking
export type NEvent =
  ILink |
  IAnnotation |
  IBookmark |
  IChapter |
  IImage |
  IPlugin |
  IScene |
  IText |
  IUpload;

export type NRecord =
  NEvent |
  INarrative |
  IAsset;

