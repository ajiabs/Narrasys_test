// @npUpgrade-player-false
/**
 * Created by githop on 6/7/16.
 */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

import { IDataSvc, IModelSvc, Partial, TDataCacheItem, ILangformKeys } from '../../../interfaces';
import { EventTemplates, TEventTemplateNames } from '../../../constants';
import { TTemplate } from '../../../models';

export interface IItemForm {
  transition: '' | 'None' | 'Fade' | 'SlideL' | 'SlideR' | 'Pop';
  highlight: '' | 'None' | 'Solid' | 'Border' | 'Side' | 'Bloom' | 'Tilt';
  color: '' | 'Invert' | 'Sepia' | 'Solarized' | 'Vivid';
  typography: '' | 'Sans' | 'Serif' | 'Book' | 'Swiss';
  timestamp: '' | 'None' | 'Inline';
  position?: string;
}

export interface ISelectOpt {
  component_name: TEventTemplateNames;
  name: string;
  template_id: string; 
}

export interface ILangOpt {
  value: ILangformKeys;
  name: 'English' | 'Spanish' | 'Chinese' | 'Portuguese' | 'French' | 'German' | 'Italian';
  isDisabled: boolean;
}

export interface ISelectService {
  getSceneName(scene);
  getSelectOpts(type);
  getVisibility(prop);
  setupItemForm(stylesArr, type): IItemForm;
  handleEpisodeItemFormUpdates(itemForm: IItemForm);
  handleEventItemFormUpdate(itemForm: IItemForm): string[];
  getTemplates(type, customerIds?: string[]);
  onSelectChange(item, itemForm);
  showTab(itemType, tabTitle);
}

export class SelectService implements ISelectService {
  static Name = 'selectService'; // tslint:disable-line
  static $inject = ['authSvc', 'modelSvc', 'dataSvc', 'ittUtils'];

  constructor (
    private authSvc,
    private modelSvc:IModelSvc,
    private dataSvc:IDataSvc,
    private ittUtils) {
  }

  private _userHasRole = this.authSvc.userHasRole;
  private _existy = this.ittUtils.existy;

  private _langOpts = [
    { value: 'en', name: 'English', isDisabled: false },
    { value: 'es', name: 'Spanish', isDisabled: false },
    { value: 'zh', name: 'Chinese', isDisabled: false },
    { value: 'pt', name: 'Portuguese', isDisabled: false },
    { value: 'fr', name: 'French', isDisabled: false },
    { value: 'de', name: 'German', isDisabled: false },
    { value: 'it', name: 'Italian', isDisabled: false }
  ];

  //select opts map
  private _select = {
    video: [],
    display: [],
    imagePosition: [],
    imagePin: [],
    questionType: [],
    language: this._langOpts
  };
  //use visibility map with getVisibility() and component directives
  private _visibility = {
    templateSelect: true,
    imageUpload: false,
    display: false,
    videoPosition: false,
    bgImagePosition: false,
    titleField: true,
    speakerField: true
  };

  //moved into a map because we will need to use this
  //when we are handing updates on background images.
  private _scenes = {
    centered: EventTemplates.CENTERED_TEMPLATE,      			        //Center 1
    centeredPro: EventTemplates.CENTERED_PRO_TEMPLATE,			      //Center 2
    '1col': EventTemplates.ONECOL_TEMPLATE,						            //Center 3
    mirroredTwoCol: EventTemplates.MIRRORED_TWOCOL_TEMPLATE, 	    //Split 2
    cornerV: EventTemplates.CORNER_V_TEMPLATE,               		  //Split 1
    centerVV: EventTemplates.CENTER_VV_TEMPLATE,             		  //Split 3
    centerVVMondrian: EventTemplates.CENTER_VV_MONDRIAN_TEMPLATE, //Split 4
    cornerH: EventTemplates.CORNER_H_TEMPLATE,                    //Split 5
    pip: EventTemplates.PIP_TEMPLATE                              //Split 6
  };

  private _bgImageTitles = {
    windowBg: 'Full window background',
    videoOverlay: 'Video overlay (16:9)',
    textBg: 'Text pane background',
    textFg: 'Text pane foreground',
    transmediaBg: 'Transmedia pane background',
    transmediaFg: 'Transmedia pane foreground'
  };

  private _D1 = {
    a: { value: 'showCurrent', name: 'show only current transmedia items' },
    b: { value: '', name: 'Show all transmedia items, highlight current ones' }
  };
  private _D2 = {
    a: { value: 'showCurrent', name: 'Show only current text items' },
    b: { value: '', name: 'Show all text items, highlight current ones' }
  };
  private _D3 = {
    a: { value: 'showCurrent', name: 'Show only current items' },
    b: { value: '', name: 'Show all items, highlight current ones' }
  };

  private _imageFieldVisibility = this._partialVis('imageUpload');
  private _displaySelectVisibility = this._partialVis('display');
  private _videoPositionSelectVisibility = this._partialVis('videoPosition');
  private _titleFieldVisibility = this._partialVis('titleField');
  private _speakerFieldVisibility = this._partialVis('speakerField');
  private _templateSelectVisibility = this._partialVis('templateSelect');
  private _bgImagePositionSelectVisibility = this._partialVis('bgImagePosition');

  // return {
  //   handleEpisodeItemFormUpdates,
  //   handleEventItemFormUpdate,
  //   showTab,
  //   onSelectChange,
  //   getTemplates,
  //   getVisibility,
  //   getSelectOpts,
  //   setupItemForm,
  //   getSceneName
  // };

 private  _setVisibility(prop, bool) {
    this._visibility[prop] = bool;
  }

 private  _partialVis(prop) {
    return function (bool) {
      return this._setVisibility(prop, bool);
    };
  }

 private _setAvailableImageOptsForLayout(sceneType, item, itemForm) {
    //if we are set to the default layout,
    //overwrite it back to an empty array
    var isInline = item.layouts[0] === 'inline';

    //TS-1147 - hide video position for videoOverlay
    //TS-1139 - all layouts, if vidOverlay, forced to fill/stretch.
    if (item.layouts.indexOf('videoOverlay') !== -1) {
      this._bgImagePositionSelectVisibility(false);
      itemForm.position = 'fill';
    }
    // altPane = transmedia pane, mainPane = text pane.
    switch (sceneType) {
      case 'centeredPro':
        this._displaySelectVisibility(true);
        this._videoPositionSelectVisibility(true);
        this._select.display = [
          { value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: true },
          { value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: true },
          { value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: true },
          { value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: true }
        ];

        if (isInline) {
          item.layouts = ['windowBg'];
        }

        item.layouts = item.layouts || ['windowBg'];
        itemForm.position = itemForm.position || 'fill'; //P1-A
        break;
      case '1col':
      case 'centered':
        var isAdmin = this._userHasRole('admin');
        this._displaySelectVisibility(true);
        this._select.display = [
          { value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: !isAdmin },
          { value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: !isAdmin },
          { value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: true },
          { value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: true },
        ];
        if (isInline) {
          item.layouts = ['windowBg'];
        }
        itemForm.position = itemForm.position || 'fill'; //P1-A
        item.layouts = item.layouts || ['windowBg'];
        break;
      case 'mirroredTwoCol':
        this._displaySelectVisibility(true);
        this._select.display = [
          { value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: false },
          { value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: false },
          { value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: false },
          { value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: false }
        ];

        if (isInline) {
          item.layouts = ['mainBg'];
        }
        itemForm.position = itemForm.position || 'fill'; //P1-A
        item.layouts = item.layouts || ['mainBg'];
        break;
      case 'cornerV':
      case 'centerVV':
      case 'cornerH':
        this._displaySelectVisibility(true);
        this._select.display = [
          { value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: false },
          { value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: false },
          { value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: false },
          { value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: false }
        ];

        if (isInline) {
          item.layouts = ['altBg'];
        }

        itemForm.position = itemForm.position || 'fill'; //P1-A
        item.layouts = item.layouts || ['altBg'];
        break;
      case 'pip':
        this._displaySelectVisibility(true);
        this._select.display = [
          { value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: true },
          { value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: true },
          { value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: true },
          { value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: false },
          { value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: false }
        ];

        if (isInline) {
          item.layouts = ['altBg'];
        }
        itemForm.position = itemForm.position || 'fill';
        item.layouts = item.layouts || ['altBg'];
        break;
      case 'centerVVMondrian':
        this._select.display = [
          { value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: true },
          { value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: false },
          { value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: false },
          { value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: true },
          { value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: true }
        ];
        if (isInline) {
          item.layouts = ['mainBg'];
        }
        item.layouts = item.layouts || ['mainBg'];
        itemForm.position = itemForm.position || 'fill';
        break;
    }

    if (itemForm.position) {
      item.styles = [itemForm.position];
    }
  }

  //not the display name, but the key of the scene map as string.
  getSceneName(scene) {

    // for some reason, .filter loses the "this" context, so creating a local instance inside this function
    let sceneList = this._scenes;
    return Object.keys(sceneList).filter( (key, index) => {
      var value = sceneList[key];
      return value === scene.component_name;
    })[0];
  }

  getSelectOpts(type) {
    return this._select[type];
  }

  getVisibility(prop) {
    return this._visibility[prop];
  }

  /*
   This logic used to live in ittItemEditor and ittEpisodeEditor and is now consolidated here.
   These loops seem to be responsible for setting up itemForm from the styles array.
   itemForm seems to be where we hold style specific data that pertains to events (aka items).
   itemForm seems to be used mostly in the customize tab and sets color, timestamp, hightlight and transition options.
   itemForm is also responsible for setting the 'pin' and 'position' props on a background image event.
   All of the above is parsed from the itemForm (if its set), and read into the item.styles array.
   When it comes time to persist, the styles array is used in dataSvc#prepItemForStorage,
   which reads the strings in the styles array and returns the corresponding ID for the entity in the DB.

   We do the inverse of this inside of watchStyleEdits below, which watches the itemForm, and builds up the styles array
   from the itemForm props. It also formats background URLs.
   */
  setupItemForm(stylesArr, type): IItemForm {

    //global for episode and item
    var _itemFormStub: IItemForm = {
      'transition': '',
      'highlight': '',
      'color': '',
      'typography': '',
      'timestamp': '',
    };
    var _itemSpecificOpts = {
      'position': '', // for image fills only
    };
    //add additional props for items
    if (type === 'item') {
      _itemFormStub = angular.extend(_itemSpecificOpts, _itemFormStub);
    }
    //return stub object if no array is passed.
    if (!this._existy(stylesArr)) {
      return _itemFormStub;
    }
    // do this in both cases, i.e. for item and episode
    for (var styleType in _itemFormStub) {
      for (var i = 0; i < stylesArr.length; i++) {
        if (stylesArr[i].substr(0, styleType.length) === styleType) { // begins with styleType
          _itemFormStub[styleType] = stylesArr[i].substr(styleType.length); // Remainder of stylesArr[i]
        }
      }
    }
    //next loop only necessary for items, so early return
    if (type === 'episode') {
      return _itemFormStub;
    }
    //need more stuff to do for items
    // position and pin don't have a prefix because I was dumb when I planned this
    for (var j = 0; j < stylesArr.length; j++) {
      if (stylesArr[j] === 'contain' || stylesArr[j] === 'cover' ||
        stylesArr[j] === 'center' || stylesArr[j] === 'fill' ||
        stylesArr[j] === 'tl' || stylesArr[j] === 'tr' ||
        stylesArr[j] === 'bl' || stylesArr[j] === 'br') {
        _itemFormStub.position = stylesArr[j];
      }
    }

    return _itemFormStub;
  }

  handleEpisodeItemFormUpdates(itemForm: IItemForm) {
    return Object.keys(itemForm).reduce(
      (stylesArr: string[], styleKey: string) => {
        if (itemForm[styleKey]) {
          stylesArr.push(styleKey + itemForm[styleKey]);
        }
        return stylesArr;
      },
      []
    );
  }

  handleEventItemFormUpdate(itemForm: IItemForm): string[] {
    return Object.keys(itemForm).reduce(
      (stylesArr: string[], styleKey: string) => {
        if (itemForm[styleKey]) {
          if (styleKey === 'position') {
            stylesArr.push(itemForm[styleKey]);
          } else {
            stylesArr.push(styleKey + itemForm[styleKey]);
          }
        }
        return stylesArr;
      },
      []
    );
  }

  getTemplates(type, customerIds?: string[]) {

    const mergeTemplateProps = (templateOptsArr: Partial<ISelectOpt>[]): ISelectOpt[] => {
      return templateOptsArr.reduce(
        (sOptsArr: ISelectOpt[], o: ISelectOpt) => {
          const template = this.modelSvc.readDataCache(
            'template',
            ('component_name' as keyof TDataCacheItem),
            o.component_name
          ) as TTemplate;
          if (template != null) {
            Object.assign(o, { template_id: template.id, name: template.displayName });
            sOptsArr.push(o);
          }
          return sOptsArr;
        },
        []
      );
    };

    switch (type) {
      case 'episode':

        const _sortAlpha = function (a, b) {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          } else {
            return 0;
          }
        };
        this._titleFieldVisibility(true); // NP-1159

        return this.dataSvc.getEpisodeTemplatesByCustomerIds(customerIds).sort(_sortAlpha);

      case 'scene':
        this._displaySelectVisibility(false);
        this._videoPositionSelectVisibility(false);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const scenes = [ //\u2022 = bullet point
          { component_name: this._scenes.centered },
          { component_name: this._scenes.centeredPro },
          { component_name: this._scenes['1col'] },
          { component_name: this._scenes.cornerV },
          { component_name: this._scenes.mirroredTwoCol },
          { component_name: this._scenes.centerVV },
          { component_name: this._scenes.centerVVMondrian },
          { component_name: this._scenes.cornerH },
          { component_name: this._scenes.pip  }
        ] as Partial<ISelectOpt>[];

        return mergeTemplateProps(scenes);
      case 'transcript':
        this._speakerFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        return mergeTemplateProps([
          { component_name: EventTemplates.TRANSCRIPT_TEMPLATE }
        ]);
      case 'annotation':
        this._speakerFieldVisibility(false);
        this._titleFieldVisibility(false);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const annotationTemplateOpts: Partial<ISelectOpt>[] = [
          { component_name: EventTemplates.HEADER_ONE_TEMPLATE },
          { component_name: EventTemplates.HEADER_TWO_TEMPLATE },
          { component_name: EventTemplates.PULLQUOTE_TEMPLATE },
          { component_name: EventTemplates.TEXT_TRANSMEDIA_TEMPLATE },
          { component_name: EventTemplates.TEXT_DEFINITION_TEMPLATE }
        ];
        return mergeTemplateProps(annotationTemplateOpts);
      case 'link':
        this._displaySelectVisibility(true);
        this._videoPositionSelectVisibility(false);
        this._imageFieldVisibility(true);
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const linkTemplates = [
          { component_name: EventTemplates.LINK_TEMPLATE },
          { component_name: EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE },
          { component_name: EventTemplates.LINK_MODAL_THUMB_TEMPLATE },
          { component_name: EventTemplates.LINK_EMBED_TEMPLATE }
        ] as Partial<ISelectOpt>[];
        if (this._userHasRole('admin')) {
          linkTemplates.splice(3, 0, {
            component_name: EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE
          });
        }
        return mergeTemplateProps(linkTemplates);
      case 'image':
        this._imageFieldVisibility(true);
        this._displaySelectVisibility(false);
        this._videoPositionSelectVisibility(false);
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const imgTemplates = [
          { component_name: EventTemplates.IMAGE_PLAIN_TEMPLATE },
          { component_name: EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE },
          { component_name: EventTemplates.SLIDING_CAPTION },
          { component_name: EventTemplates.IMAGE_THUMBNAIL_TEMPLATE },
          { component_name: EventTemplates.IMAGE_FILL_TEMPLATE }
        ] as Partial<ISelectOpt>[];
        return mergeTemplateProps(imgTemplates);
      case 'file':
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(false);
        this._bgImagePositionSelectVisibility(false);
        return mergeTemplateProps([
          { component_name: EventTemplates.FILE_TEMPLATE }
        ]);
      case 'question':
        this._displaySelectVisibility(true);
        this._imageFieldVisibility(true);
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        return mergeTemplateProps([
          { component_name: EventTemplates.QUESTION_TEMPLATE  }
        ]);
      case 'chapter':
        //chapters have no template, but need to do side-effects
        this._titleFieldVisibility(true);
        break;
    }
  }

  onSelectChange(item, itemForm) {
    this._displaySelectVisibility(false);
    switch (item.producerItemType) {
      case 'scene':
        var isInline = item.layouts[0] === 'inline';
        switch (item.component_name) {
          case EventTemplates.CENTERED_TEMPLATE: //centered
          case EventTemplates.CENTERED_PRO_TEMPLATE: //Centered Pro, Hide Transcript & Transmedia
            this._videoPositionSelectVisibility(false);
            this._displaySelectVisibility(false);
            item.layouts[0] = ''; //P1 Video Centered
            item.layouts[1] = this._D1.a.value; //showCurrent;
            break;
          case EventTemplates.CENTER_VV_TEMPLATE: //Vertical Pro, Hide Transcript
          case EventTemplates.CENTER_VV_MONDRIAN_TEMPLATE: //Vertical Pro Mondrian, Hide Transcript
            this._displaySelectVisibility(false);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              { value: 'videoLeft', name: 'Video on Left' },
              { value: 'videoRight', name: 'Video on Right' }
            ];
            item.layouts[1] = this._D1.a.value;
            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
            }
            break;
          case EventTemplates.CORNER_V_TEMPLATE: //Corner video, vertical
          case EventTemplates.CORNER_H_TEMPLATE: //Corner video, horizontal
          case EventTemplates.PIP_TEMPLATE: //picture in picture
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              { value: 'videoLeft', name: 'Video on Left' },
              { value: 'videoRight', name: 'Video on Right' }
            ];
            this._select.display = [
              { value: this._D1.a.value, name: this._D1.a.name },
              { value: this._D1.b.value, name: this._D1.b.name }
            ];

            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
              item.layouts[1] = this._D1.a.value;
            }
            break;
          case EventTemplates.MIRRORED_TWOCOL_TEMPLATE: // Two Columns (v2 mirrored vert)
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              { value: 'videoLeft', name: 'Video on Left' },
              { value: 'videoRight', name: 'Video on Right' }
            ];
            this._select.display = [
              { value: this._D2.a.value, name: this._D2.a.name },
              { value: this._D2.b.value, name: this._D2.b.name }
            ];

            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
              item.layouts[1] = this._D2.b.value; //show all + highlight current
            }
            break;
          case EventTemplates.ONECOL_TEMPLATE: //One Column
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(false);
            this._select.display = [
              { value: this._D3.a.value, name: this._D3.a.name },
              { value: this._D3.b.value, name: this._D3.b.name }
            ];
            item.layouts[0] = ''; //P1 Video Centered
            if (isInline) {
              item.layouts[1] = this._D3.b.value;
            }
            break;
        }
        break;
      case 'link':
        this._displaySelectVisibility(true);
        this._imageFieldVisibility(true);
        this._templateSelectVisibility(true);
        if (item.stop === true) {
          item.layouts[0] = 'windowFg';
          //prevent link-modal template from opening on top of stop-item modal
          if (item.component_name === EventTemplates.LINK_MODAL_THUMB_TEMPLATE) {
            item.component_name = EventTemplates.LINK_EMBED_TEMPLATE;
            // angular.forEach(item.templateOpts, function(opt) {
            // 	console.log('opt!!', opt);
            // });
          }
        } else {
          item.layouts[0] = 'inline';
        }

        switch (item.component_name) {
          case EventTemplates.LINK_TEMPLATE:
          case EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE:
          case EventTemplates.LINK_MODAL_THUMB_TEMPLATE:
            this._imageFieldVisibility(true);
            break;
          case EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE:
          case EventTemplates.LINK_EMBED_TEMPLATE:
            this._imageFieldVisibility(false);
            break;
        }

        break;
      case 'transcript':
        this._displaySelectVisibility(false);
        item.layouts[0] = 'inline';
        break;
      case 'annotation':
        item.layouts[0] = 'inline';
        switch (item.component_name) {
          case EventTemplates.HEADER_ONE_TEMPLATE:
          case EventTemplates.HEADER_TWO_TEMPLATE:
            this._speakerFieldVisibility(false);
            this._titleFieldVisibility(false);
            break;
          case EventTemplates.PULLQUOTE_TEMPLATE:
            this._speakerFieldVisibility(true);
            this._titleFieldVisibility(false);
            break;
          case EventTemplates.TEXT_TRANSMEDIA_TEMPLATE:
          case EventTemplates.TEXT_DEFINITION_TEMPLATE:
            this._speakerFieldVisibility(false);
            this._titleFieldVisibility(true);
            break;
        }
        if (item.stop === true) {
          item.layouts[0] = 'windowFg';
        }
        break;
      case 'question':
        this._select.questionType = [
          { value: 'mc-poll', name: 'Poll' },
          { value: 'mc-formative', name: 'Formative' }
        ];
        item.layouts[0] = 'windowFg';
        item.stop = true;
        break;
      case 'image':
        //will set to true in image fill
        this._displaySelectVisibility(false);
        var _currentSceneName = this.getSceneName(this.modelSvc.scene(item.scene_id));
        switch (item.component_name) {
          case EventTemplates.IMAGE_PLAIN_TEMPLATE:
          case EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE:
          case EventTemplates.SLIDING_CAPTION:
          case EventTemplates.IMAGE_THUMBNAIL_TEMPLATE:
            //set back to blank when not a BG image.
            itemForm.pin = itemForm.position = '';
            item.layouts[0] = 'inline';
            break;
          case EventTemplates.IMAGE_FILL_TEMPLATE:
            item.cosmetic = true;
            this._displaySelectVisibility(true);
            this._bgImagePositionSelectVisibility(true);
            this._select.imagePosition = [
              { value: 'fill', name: 'Fill and stretch' },
              { value: 'contain', name: 'Contain' },
              { value: 'cover', name: 'Cover and crop' },
              { value: 'tl', name: 'Top Left' },
              { value: 'tr', name: 'Top Right' },
              { value: 'bl', name: 'Bottom Left' },
              { value: 'br', name: 'Bottom Right' },
            ];
            this._setAvailableImageOptsForLayout(_currentSceneName, item, itemForm);
        }
        if (item.stop === true) {
          item.layouts[0] = 'windowFg';
        }
        break;
      case 'file':
        item.showInlineDetail = false;
        switch (item.component_name) {
          case EventTemplates.LINK_TEMPLATE:
            item.showInlineDetail = true;
            break;
          case EventTemplates.FILE_TEMPLATE:
          case EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE:
          case EventTemplates.LINK_MODAL_THUMB_TEMPLATE:
            break;
        }
        if (item.stop === true) {
          item.layouts[0] = 'windowFg';
        }

        break;
    }
  }

  showTab(itemType, tabTitle) {
    switch (itemType) {
      case 'scene':
        switch (tabTitle) {
          case 'Item':
            return false;
          case 'Style':
            return true;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'transcript':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'annotation':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'link':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'image':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'file':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'question':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return this._userHasRole('admin');
        }
        break;
      case 'chapter':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return false;
        }
    }
  }
}

