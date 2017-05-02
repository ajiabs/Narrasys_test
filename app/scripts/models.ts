/**
 * Created by githop on 5/1/17.
 */

export class IEvent {
  //props
  start_time: number;
  type: 'Annotation' | 'Bookmark' | 'File' | 'Image' | 'Link' | 'Plugin' | 'Scene' | 'Chapter' | 'Text' | 'Upload';
  end_time: number;
  title: { [lang: string]: string };
  description: { [lang: string]: string };
  cosmetic: boolean;
  stop: boolean;
//props not in any schema but added dynamically either on the backend somewhere client-side;
  noEmbed?: boolean;
  avatar_id: string;
  templateOpts?: any;
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
  _id: string;
  status: string;
  response_code: number;
  location: string;
  updated_at: Date;
  x_frame_options: string;
}

export class ILink extends IEvent {
  type: 'Link';
  _type: 'Link';
  target: '_blank' | '_self';
  url: string;
  display_title?: string;
  display_description?: string;
  styles?: string[];
  forceEmbed?: false;
  showInlineDetail?: boolean;
  //relations
  link_image_id: string;
  url_status?: ILinkStatus;

}

export class IAnnotation extends IEvent {
  type: 'Annotation';
  _type: 'Annotation';
  annotator: { [lang: string]: string };
  annotation: { [lang: string]: string };
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
  correctFeedback: { [lang: string]: string };
  distractors: { index: number, text: string }[];
  incorrectFeedback: { [lang: string]: string };
  questionText: { [lang: string]: string };
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

export function createInstance(type: string, data: any): NEvent {
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




