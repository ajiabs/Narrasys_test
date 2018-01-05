import { IAnnotators, ILangForm, ILangformKeys, IMasterAssetVideoObject } from './interfaces';


import {
  EventTemplates, TAnnotationItemNames, TFileItemNames, TImageItemNames, TLayoutNames, TLinkItemNames,
  TSocialTagTypes
} from './constants';

/**
 * Created by githop on 5/1/17.
 */

class UIAsset {
  id: string;
  css_name: string;
  display_name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

// experimental
export class NpComponentTemplateDirective implements ng.IDirective {
  restrict: string = 'A';
  static Name; // tslint:disable-line
  static $inject = [];

  static factory(): ng.IDirectiveFactory {
    const instance = (...args) => new NpComponentTemplateDirective(...args);
    instance.$inject = NpComponentTemplateDirective.$inject;
    return instance;
  }
}

export class IStyle extends UIAsset {
}

export class ILayout extends UIAsset {
}

export class ITemplateImage {
  src: string;
  alt_text?: string;
  css_class?: string;
  url?: string;
}

export class ICssConfiguration {
  _id: string;
  fill_class?: string;
  font_configurations: { fallback: string, font_id: string, variant: string, _id: string }[];
  legacy_logos: ITemplateImage[];
  legacy_banner_logo: ITemplateImage;
}

export class IFont {
  _id: string;
  google: { families: string[] };
}

export class ITemplate {
  id: string;
  name: string;
  displayName: string;
  event_types: string[];
  pro_episode_template?: boolean;
  applies_to_episodes?: boolean;
  applies_to_narratives?: boolean;
  created_at: Date;
  component_name?: string;
}

export type TTemplate = IEpisodeTemplate | IItemTemplate | ILayoutTemplate;

export class IEpisodeTemplate extends ITemplate {
  type: 'Episode';
  css?: string;
  css_configuration?: ICssConfiguration;
  customer_ids?: string[];
  fonts?: IFont;
}

export class IItemTemplate extends ITemplate {
  type: 'Annotation' | 'Upload' | 'Link' | 'Plugin';
  url: string;
}

export class ILayoutTemplate extends ITemplate {
  type: 'Scene';
  url: string;
}

export class IMasterAsset {
  _id: string;
  _type: string;
  container_id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  extension: string;
  content_type: string;
  size: number;
  name: ILangForm;
  description: ILangForm;
  url: string;
  episodes_count: number;
  episode_poster_frames_count: number;
  links_count: number;
  annotations_count: number;
  narratives_count: number;
  timelines_count: number;
  uploads_count: number;
  plugins_count: number;
  tags: string[];
  alternate_urls: string[];
  you_tube_url: string | null;
  frame_rate: string;
  frame_rate_n: number;
  frame_rate_d: number;
  start_time: string;
  duration: string;
  width: number;
  height: number;
  urls:  IMasterAssetVideoObject;
  mediaSrcArr: string[];
  cssBgUrl: string;
  display_name: string;
}

export class IEpisode {
  _id: string;
  annotators: IAnnotators;
  chapters: IChapter[];
  children: any[];
  container_id: string;
  created_at: Date;
  defaultLanguage: ILangformKeys | false;
  description: ILangForm;
  display_description: string;
  display_title: string;
  items: NEvent[];
  languages: { code: string, default: boolean }[];
  masterAsset: IMasterAsset;
  master_asset_id: string;
  _master_asset_was_changed?: boolean;
  replacingMasterAsset?: boolean;
  parent_id: string;
  scenes: IScene[];
  status: string;
  styleCss: string;
  templateCss?: string;
  style_id: string[];
  styles: string[];
  template_id: string;
  template?: IEpisodeTemplate;
  title: ILangForm;
  updated_at: Date;
  poster?: IAsset;
  poster_frame_id?: string;
  swap?: any;

  get producerItemType(): string {
    return 'episode';
  }

  setCurrentScene(scene: IScene): void {
    if (this.scenes && this.scenes.length) {
      const ci = this.scenes.indexOf(scene);
      const pre = this.scenes.slice(0, ci);
      const post = this.scenes.slice(ci + 1);

      scene.setCurrent();

      if (pre.length > 0) {
        pre.forEach(s => s.setPast());
      }

      if (post.length > 0) {
        post.forEach(s => s.setFuture());
      }

      this.scenes = [...pre, scene, ...post];
    }
  }
}

export class IContainer {
  _id: string;
  children: IContainer[];
  customer_id: string;
  display_name: string;
  episodes: IEpisode[];
  evenOdd?: boolean;
  haveNotLoadedChildData?: boolean;
  wasClicked?: boolean;
  isActive?: boolean;
  keywords: ILangForm;
  loadedChildData?: boolean;
  name: ILangForm;
  parent_id: string;
  sort_order: number;
  editingContainer?: boolean;
  newContainerTitle?: string;
  newContainerName?: string;
  addingContainer?: boolean;
  showChildren?: boolean;
}

export class ITimeline {
  _id?: string;
  name: ILangForm;
  description: ILangForm;
  hidden: boolean;
  sort_order: number;
  path_slug: ILangForm;
  episode_segments: any[];
  timeline_image_ids: string[] = [];
  parent_episode?: IEpisode;
  duration: number;
}

export class ITempTimeline extends ITimeline {
  social_image_square?: any;
  social_image_wide?: any;
  isTemp: boolean;
  index: number;
}

export class ICustomer {
  _id: string;
  name: ILangForm;
  domains: string[];
  active: boolean;
  guest_access_allowed: boolean;
  create_s3_transcodes: boolean;
  youtube_allowed: boolean;
  login_url: boolean;
  login_via_top_window_only: boolean;
  track_user_event_actions: boolean;
  track_user_episode_metrics: boolean;
  oauth2_message: ILangForm;
  oauth2_providers: string[];
  root_container_id: string;
  narratives?: INarrative[];
  isActive?: boolean;
  showNarratives?: boolean;
  evenOdd?: boolean;
}

export class INarrative {
  _id: string;
  name: ILangForm;
  description: ILangForm;
  guest_access_allowed: boolean;
  authenticated_access_allowed: boolean;
  customer_id: string;
  disable_navigation: boolean;
  disable_new_window: boolean;
  enable_social_sharing: boolean;
  path_slug: ILangForm;
  support_url: string;
  narrative_subdomain?: string;
  timelines?: ITimeline[];
  narrative_image_ids: string[] = [];
  disableSocialshare?: boolean;
  social_image_square?: { file: FileList };
  social_image_wide?: { file: FileList };
  evenOdd?: boolean;
  error?: string;
}

export class IAsset {
  _id: string;
  _type: string;
  status: string;
  upload: any;
  url: string;
  cssBgUrl?: string;
  filename: string;
  original_filename: string;
  content_type: string;
  extension: string;
  size: number;
  name: ILangForm;
  description: ILangForm;
  tags: TSocialTagTypes[];
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
  duration?: number;
}

type TEventTypes = 'Annotation'
  | 'Bookmark'
  | 'File'
  | 'Image'
  | 'Link'
  | 'Plugin'
  | 'Scene'
  | 'Chapter'
  | 'Text'
  | 'Upload';

export class IEvent {
  //props
  _id: string;
  start_time: number;
  type: TEventTypes;
  _type: string;
  end_time: number;
  title: ILangForm;
  description: ILangForm;
  cosmetic: boolean;
  stop: boolean;
//props not in any schema but added dynamically either on the backend somewhere client-side;
  state?: 'isCurrent' | 'isPast' | 'isFuture';
  isCurrent?: boolean;
  avatar_id: string;
  templateOpts?: any[];
  //relations
  episode_id: string;
  user_id: string;
  template_id: string;
  layout_id: string;
  style_id: string;
  styles: string[];
  layouts: string[] = ['inline'];
  component_name?: string;
  cur_episode_id?: string;
  renderTemplate?: boolean = true;
  producerItemType: string;
  asset?: IAsset;
  asset_id?: string;
  link_image_id?: string;
  annotation_image_id: string;
  sxs?: any;
  removedAssets?: string[];

  setFuture(): void {
    this.state = 'isFuture';
    this.isCurrent = false;
  }

  setPast(): void {
    this.state = 'isPast';
    this.isCurrent = false;
  }

  setCurrent(): void {
    this.isCurrent = true;
    this.state = 'isCurrent';
  }
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
  styles: string[];
  showInlineDetail?: boolean;
  //relations
  link_image_id: string;
  url_status?: ILinkStatus;
  isVideoUrl: boolean;
  mixedContent?: boolean;

  get producerItemType() {
    return 'link';
  }

  component_name?: TLinkItemNames;
}

export class IAnnotation extends IEvent {
  type: 'Annotation';
  _type: 'Annotation';
  annotator: ILangForm;
  annotation: ILangForm;
  chapter_marker: boolean = false;
  //belongs_to annotation image;
  annotation_image_id: string;
  component_name?: TAnnotationItemNames;

  get producerItemType() {
    if (this.component_name) {
      if (this.component_name === EventTemplates.TRANSCRIPT_TEMPLATE) {
        return 'transcript';
      }
      return 'annotation';
    }
  }
}

export class IBookmark extends IEvent {
  type: 'Bookmark';
  _type: 'Bookmark';
}

export class IChapter extends IEvent {
  type: 'Chapter';
  _type: 'Chapter';

  get producerItemType() {
    return 'chapter';
  }
}

export class IImage extends IEvent {
  type: 'Image';
  _type: 'Image';
  component_name?: TImageItemNames;
}

export class IPluginData {
  hasBeenAnswered: boolean;
  correctfeedback: ILangForm;
  selectedDistractor: number;
  answer_counts: any;
  distractors: {
    index: number;
    text: ILangForm | string;
    correct?: boolean;
    selected?: boolean;
  }[];
  incorrectfeedback: ILangForm;
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

  get producerItemType() {
    if (this.component_name && /question/.test(this.component_name)) {
      return 'question';
    }
  }
}

export class IScene extends IEvent {
  type: 'Scene';
  _type: 'Scene';
  _internal?: boolean; //client only
  cur_episode_id: string;
  scene_id: string;
  component_name?: TLayoutNames;

  get producerItemType() {
    return 'scene';
  }
}

export class IText extends IEvent {
  type: 'Text';
  _type: 'Text';
}

export class IUpload extends IEvent {
  type: 'Upload';
  _type: 'Upload';
  asset_id: string;
  component_name?: TFileItemNames;

  get producerItemType() {
    if (this.component_name) {
      if (this.component_name === EventTemplates.FILE_TEMPLATE) {
        return 'file';
      }
      return 'image';
    }
  }
}

type TInstance =
  'Link'
  | 'Annotation'
  | 'Bookmark'
  | 'Chapter'
  | 'Image'
  | 'Plugin'
  | 'Scene'
  | 'Text'
  | 'Upload'
  | 'Narrative'
  | 'Asset'
  | 'Customer'
  | 'Timeline'
  | 'Episode'
  | 'Container'
  | 'EpisodeTemplate'
  | 'LayoutTemplate'
  | 'ItemTemplate'
  | 'Layout'
  | 'Style'
  | 'MasterAsset';

export function createInstance<T>(type: TInstance, data: any): T {
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
    case 'Customer':
      model = new ICustomer();
      break;
    case 'Timeline':
      model = new ITimeline();
      break;
    case 'Episode':
      model = new IEpisode();
      Object.assign(model, data);
      if (data.masterAsset) {
        model.masterAsset = Object.assign(new IMasterAsset(), data.masterAsset);
      }
      return model;
    case 'MasterAsset':
      model = new IMasterAsset();
      break;
    case 'Container':
      model = new IContainer();
      break;
    case 'LayoutTemplate':
      model = new ILayoutTemplate();
      break;
    case 'ItemTemplate':
      model = new IItemTemplate();
      break;
    case 'EpisodeTemplate':
      model = new IEpisodeTemplate();
      Object.assign(model, data);
      //handle any 'relations'
      if (data.css_configuration) {
        model.css_configuration = Object.assign(new ICssConfiguration(), data.css_configuration);
      }

      if (data.fonts) {
        model.fonts = Object.assign(new IFont(), data.fonts);
      }
      return model;
    case 'Layout':
      model = new ILayout();
      break;
    case 'Style':
      model = new IStyle();
      break;
  }
  Object.assign(model, data);
  return model;
}

//union type to provide type checking
export type NEvent = IEvent
  | ILink
  | IAnnotation
  | IBookmark
  | IChapter
  | IImage
  | IPlugin
  | IScene
  | IText
  | IUpload;

export type NRecord = NEvent
  | INarrative
  | IAsset
  | ICustomer
  | ITimeline
  | IEpisode
  | IContainer;
