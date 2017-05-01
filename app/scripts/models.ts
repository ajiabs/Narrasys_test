import {link} from 'fs';
/**
 * Created by githop on 5/1/17.
 */


export class IEvent {
  //props
  start_time: number;
  type: 'Annotation' | 'Bookmark' | 'File' | 'Image' | 'Link' | 'Plugin' | 'Scene' | 'Chapter' | 'Text' | 'Upload';
  end_time: number;
  title: {[lang: string]: string};
  description: {[lang: string]: string};
  cosmetic: boolean;
  stop: boolean;
//props not in any schema but added dynamically either on the backend somewhere client-side;
  noEmbed?: boolean;
  avatar_id: string;
  //relations
  episode_id: string;
  user_id: string;
  template_id: string;
  layout_id: string;
  style_id: string;
  //group ??
  //event_category ??
  constructor(eventData) {
    Object.entries(eventData)
      .forEach(([key, val]) => this[key] = val);
  }
}

export class ILinkStatus {
  _id: string;
  status: string;
  response_code: number;
  location: string;
  updated_at: Date;
  x_frame_options: string;
  constructor(linkStatus) {
    Object.entries(linkStatus)
      .forEach(([key, val]) => this[key] = val);
  }
}

export class ILink extends IEvent {
  type: 'Link';
  _type: 'Link';
  url: string;
  display_title?: string;
  display_description?: string;
  styles?: string[];
  target: '_blank' | '_self';
  //relations
  link_image_id: string;
  url_status?: ILinkStatus;
  templateUrl?: string;
  constructor(eventData) {
    super(eventData);
    if (eventData.url_status != null) {
      this.url_status = new ILinkStatus(eventData.url_status);
    }
  }
}

export class IAnnotation extends IEvent {
  type: 'Annotation';
  _type: 'Annotation';
  annotator: {[lang: string]: string};
  annotation: {[lang: string]: string};
  chapter_marker: boolean = false;
  //belongs_to annotation image;
  annotation_image_id: string;
  templateUrl?: string;
  constructor(eventData) {
    super(eventData);
  }
}

export class IBookmark extends IEvent {
  type: 'Bookmark';
  _type: 'Bookmark';
  constructor(eventData) {
    super(eventData);
  }
}

export class IChapter extends IEvent {
  type: 'Chapter';
  _type: 'Chapter';
  constructor(eventData) {
    super(eventData);
  }
}

export class IImage extends IEvent {
  type: 'Image';
  _type: 'Image';
  templateUrl?: string;
  constructor(eventData) {
    super(eventData);
  }
}

class IPluginData {
  correctFeedback: {[lang: string]: string};
  distractors: {index: number, text: string}[];
  incorrectFeedback: {[lang: string]: string};
  questionText: {[lang: string]: string};
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
  constructor(eventData) {
    super(eventData);
  }
}

export class IScene extends IEvent {
  type: 'Scene';
  _type: 'Scene';
  templateUrl?: string;
  constructor(eventData) {
    super(eventData);
  }
}

export class IText extends IEvent {
  type: 'Text';
  _type: 'Text';
  constructor(eventData) {
    super(eventData);
  }
}

export class IUpload extends IEvent {
  type: 'Upload';
  _type: 'Upload';
  asset_id: string;
  constructor(eventData) {
    super(eventData);
  }
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

