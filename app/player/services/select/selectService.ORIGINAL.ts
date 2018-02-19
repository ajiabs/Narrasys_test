// @npUpgrade-player-false
/**
 * Created by githop on 6/7/16.
 */
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

selectService.$inject = ['authSvc', 'modelSvc', 'dataSvc', 'ittUtils'];

export default function selectService(authSvc, modelSvc: IModelSvc, dataSvc: IDataSvc, ittUtils) {
  var _userHasRole = authSvc.userHasRole;
  var _existy = ittUtils.existy;

  var _langOpts = [
    { value: 'en', name: 'English', isDisabled: false },
    { value: 'es', name: 'Spanish', isDisabled: false },
    { value: 'zh', name: 'Chinese', isDisabled: false },
    { value: 'pt', name: 'Portuguese', isDisabled: false },
    { value: 'fr', name: 'French', isDisabled: false },
    { value: 'de', name: 'German', isDisabled: false },
    { value: 'it', name: 'Italian', isDisabled: false }
  ];

  //select opts map
  var _select = {
    video: [],
    display: [],
    imagePosition: [],
    imagePin: [],
    questionType: [],
    language: _langOpts
  };
  //use visibility map with getVisibility() and component directives
  var _visibility = {
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
  var _scenes = {
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

  var _bgImageTitles = {
    windowBg: 'Full window background',
    videoOverlay: 'Video overlay (16:9)',
    textBg: 'Text pane background',
    textFg: 'Text pane foreground',
    transmediaBg: 'Transmedia pane background',
    transmediaFg: 'Transmedia pane foreground'
  };

  var _D1 = {
    a: { value: 'showCurrent', name: 'show only current transmedia items' },
    b: { value: '', name: 'Show all transmedia items, highlight current ones' }
  };
  var _D2 = {
    a: { value: 'showCurrent', name: 'Show only current text items' },
    b: { value: '', name: 'Show all text items, highlight current ones' }
  };
  var _D3 = {
    a: { value: 'showCurrent', name: 'Show only current items' },
    b: { value: '', name: 'Show all items, highlight current ones' }
  };

  var _imageFieldVisibility = _partialVis('imageUpload');
  var _displaySelectVisibility = _partialVis('display');
  var _videoPositionSelectVisibility = _partialVis('videoPosition');
  var _titleFieldVisibility = _partialVis('titleField');
  var _speakerFieldVisibility = _partialVis('speakerField');
  var _templateSelectVisibility = _partialVis('templateSelect');
  var _bgImagePositionSelectVisibility = _partialVis('bgImagePosition');

  return {
    handleEpisodeItemFormUpdates,
    handleEventItemFormUpdate,
    showTab,
    onSelectChange,
    getTemplates,
    getVisibility,
    getSelectOpts,
    setupItemForm,
    getSceneName
  };

  function _setVisibility(prop, bool) {
    _visibility[prop] = bool;
  }

  function _partialVis(prop) {
    return function (bool) {
      return _setVisibility(prop, bool);
    };
  }

  function _setAvailableImageOptsForLayout(sceneType, item, itemForm) {
    //if we are set to the default layout,
    //overwrite it back to an empty array
    var isInline = item.layouts[0] === 'inline';

    //TS-1147 - hide video position for videoOverlay
    //TS-1139 - all layouts, if vidOverlay, forced to fill/stretch.
    if (item.layouts.indexOf('videoOverlay') !== -1) {
      _bgImagePositionSelectVisibility(false);
      itemForm.position = 'fill';
    }
    // altPane = transmedia pane, mainPane = text pane.
    switch (sceneType) {
      case 'centeredPro':
        _displaySelectVisibility(true);
        _videoPositionSelectVisibility(true);
        _select.display = [
          { value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: true },
          { value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: true },
          { value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: true },
          { value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: true }
        ];

        if (isInline) {
          item.layouts = ['windowBg'];
        }

        item.layouts = item.layouts || ['windowBg'];
        itemForm.position = itemForm.position || 'fill'; //P1-A
        break;
      case '1col':
      case 'centered':
        var isAdmin = _userHasRole('admin');
        _displaySelectVisibility(true);
        _select.display = [
          { value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: !isAdmin },
          { value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: !isAdmin },
          { value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: true },
          { value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: true },
        ];
        if (isInline) {
          item.layouts = ['windowBg'];
        }
        itemForm.position = itemForm.position || 'fill'; //P1-A
        item.layouts = item.layouts || ['windowBg'];
        break;
      case 'mirroredTwoCol':
        _displaySelectVisibility(true);
        _select.display = [
          { value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: false },
          { value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: false },
          { value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: false },
          { value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: false }
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
        _displaySelectVisibility(true);
        _select.display = [
          { value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false },
          { value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: false },
          { value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: false },
          { value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: false },
          { value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: false }
        ];

        if (isInline) {
          item.layouts = ['altBg'];
        }

        itemForm.position = itemForm.position || 'fill'; //P1-A
        item.layouts = item.layouts || ['altBg'];
        break;
      case 'pip':
        _displaySelectVisibility(true);
        _select.display = [
          { value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: true },
          { value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: true },
          { value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: true },
          { value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: false },
          { value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: false }
        ];

        if (isInline) {
          item.layouts = ['altBg'];
        }
        itemForm.position = itemForm.position || 'fill';
        item.layouts = item.layouts || ['altBg'];
        break;
      case 'centerVVMondrian':
        _select.display = [
          { value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: true },
          { value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false },
          { value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: false },
          { value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: false },
          { value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: true },
          { value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: true }
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
  function getSceneName(scene) {
    return Object.keys(_scenes).filter(function (key) {
      return _scenes[key] === scene.component_name;
    })[0];
  }

  function getSelectOpts(type) {
    return _select[type];
  }

  function getVisibility(prop) {
    return _visibility[prop];
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
  function setupItemForm(stylesArr, type): IItemForm {

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
    if (!_existy(stylesArr)) {
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

  function handleEpisodeItemFormUpdates(itemForm: IItemForm) {
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

  function handleEventItemFormUpdate(itemForm: IItemForm): string[] {
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

  function getTemplates(type, customerIds?: string[]) {

    const mergeTemplateProps = (templateOptsArr: Partial<ISelectOpt>[]): ISelectOpt[] => {
      return templateOptsArr.reduce(
        (sOptsArr: ISelectOpt[], o: ISelectOpt) => {
          const template = modelSvc.readDataCache(
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
        _titleFieldVisibility(true); // NP-1159

        return dataSvc.getEpisodeTemplatesByCustomerIds(customerIds).sort(_sortAlpha);

      case 'scene':
        _displaySelectVisibility(false);
        _videoPositionSelectVisibility(false);
        _templateSelectVisibility(true);
        _bgImagePositionSelectVisibility(false);
        const scenes = [ //\u2022 = bullet point
          { component_name: _scenes.centered },
          { component_name: _scenes.centeredPro },
          { component_name: _scenes['1col'] },
          { component_name: _scenes.cornerV },
          { component_name: _scenes.mirroredTwoCol },
          { component_name: _scenes.centerVV },
          { component_name: _scenes.centerVVMondrian },
          { component_name: _scenes.cornerH },
          { component_name: _scenes.pip  }
        ] as Partial<ISelectOpt>[];

        return mergeTemplateProps(scenes);
      case 'transcript':
        _speakerFieldVisibility(true);
        _templateSelectVisibility(true);
        _bgImagePositionSelectVisibility(false);
        return mergeTemplateProps([
          { component_name: EventTemplates.TRANSCRIPT_TEMPLATE }
        ]);
      case 'annotation':
        _speakerFieldVisibility(false);
        _titleFieldVisibility(false);
        _templateSelectVisibility(true);
        _bgImagePositionSelectVisibility(false);
        const annotationTemplateOpts: Partial<ISelectOpt>[] = [
          { component_name: EventTemplates.HEADER_ONE_TEMPLATE },
          { component_name: EventTemplates.HEADER_TWO_TEMPLATE },
          { component_name: EventTemplates.PULLQUOTE_TEMPLATE },
          { component_name: EventTemplates.TEXT_TRANSMEDIA_TEMPLATE },
          { component_name: EventTemplates.TEXT_DEFINITION_TEMPLATE }
        ];
        return mergeTemplateProps(annotationTemplateOpts);
      case 'link':
        _displaySelectVisibility(true);
        _videoPositionSelectVisibility(false);
        _imageFieldVisibility(true);
        _titleFieldVisibility(true);
        _templateSelectVisibility(true);
        _bgImagePositionSelectVisibility(false);
        const linkTemplates = [
          { component_name: EventTemplates.LINK_TEMPLATE },
          { component_name: EventTemplates.LINK_WITHIMAGE_NOTITLE_TEMPLATE },
          { component_name: EventTemplates.LINK_MODAL_THUMB_TEMPLATE },
          { component_name: EventTemplates.LINK_EMBED_TEMPLATE }
        ] as Partial<ISelectOpt>[];
        if (_userHasRole('admin')) {
          linkTemplates.splice(3, 0, {
            component_name: EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE
          });
        }
        return mergeTemplateProps(linkTemplates);
      case 'image':
        _imageFieldVisibility(true);
        _displaySelectVisibility(false);
        _videoPositionSelectVisibility(false);
        _titleFieldVisibility(true);
        _templateSelectVisibility(true);
        _bgImagePositionSelectVisibility(false);
        const imgTemplates = [
          { component_name: EventTemplates.IMAGE_PLAIN_TEMPLATE },
          { component_name: EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE },
          { component_name: EventTemplates.SLIDING_CAPTION },
          { component_name: EventTemplates.IMAGE_THUMBNAIL_TEMPLATE },
          { component_name: EventTemplates.IMAGE_FILL_TEMPLATE }
        ] as Partial<ISelectOpt>[];
        return mergeTemplateProps(imgTemplates);
      case 'file':
        _titleFieldVisibility(true);
        _templateSelectVisibility(false);
        _bgImagePositionSelectVisibility(false);
        return mergeTemplateProps([
          { component_name: EventTemplates.FILE_TEMPLATE }
        ]);
      case 'question':
        _displaySelectVisibility(true);
        _imageFieldVisibility(true);
        _titleFieldVisibility(true);
        _templateSelectVisibility(true);
        _bgImagePositionSelectVisibility(false);
        return mergeTemplateProps([
          { component_name: EventTemplates.QUESTION_TEMPLATE  }
        ]);
      case 'chapter':
        //chapters have no template, but need to do side-effects
        _titleFieldVisibility(true);
        break;
    }
  }

  function onSelectChange(item, itemForm) {
    _displaySelectVisibility(false);
    switch (item.producerItemType) {
      case 'scene':
        var isInline = item.layouts[0] === 'inline';
        switch (item.component_name) {
          case EventTemplates.CENTERED_TEMPLATE: //centered
          case EventTemplates.CENTERED_PRO_TEMPLATE: //Centered Pro, Hide Transcript & Transmedia
            _videoPositionSelectVisibility(false);
            _displaySelectVisibility(false);
            item.layouts[0] = ''; //P1 Video Centered
            item.layouts[1] = _D1.a.value; //showCurrent;
            break;
          case EventTemplates.CENTER_VV_TEMPLATE: //Vertical Pro, Hide Transcript
          case EventTemplates.CENTER_VV_MONDRIAN_TEMPLATE: //Vertical Pro Mondrian, Hide Transcript
            _displaySelectVisibility(false);
            _videoPositionSelectVisibility(true);
            _select.video = [
              { value: 'videoLeft', name: 'Video on Left' },
              { value: 'videoRight', name: 'Video on Right' }
            ];
            item.layouts[1] = _D1.a.value;
            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
            }
            break;
          case EventTemplates.CORNER_V_TEMPLATE: //Corner video, vertical
          case EventTemplates.CORNER_H_TEMPLATE: //Corner video, horizontal
          case EventTemplates.PIP_TEMPLATE: //picture in picture
            _displaySelectVisibility(true);
            _videoPositionSelectVisibility(true);
            _select.video = [
              { value: 'videoLeft', name: 'Video on Left' },
              { value: 'videoRight', name: 'Video on Right' }
            ];
            _select.display = [
              { value: _D1.a.value, name: _D1.a.name },
              { value: _D1.b.value, name: _D1.b.name }
            ];

            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
              item.layouts[1] = _D1.a.value;
            }
            break;
          case EventTemplates.MIRRORED_TWOCOL_TEMPLATE: // Two Columns (v2 mirrored vert)
            _displaySelectVisibility(true);
            _videoPositionSelectVisibility(true);
            _select.video = [
              { value: 'videoLeft', name: 'Video on Left' },
              { value: 'videoRight', name: 'Video on Right' }
            ];
            _select.display = [
              { value: _D2.a.value, name: _D2.a.name },
              { value: _D2.b.value, name: _D2.b.name }
            ];

            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
              item.layouts[1] = _D2.b.value; //show all + highlight current
            }
            break;
          case EventTemplates.ONECOL_TEMPLATE: //One Column
            _displaySelectVisibility(true);
            _videoPositionSelectVisibility(false);
            _select.display = [
              { value: _D3.a.value, name: _D3.a.name },
              { value: _D3.b.value, name: _D3.b.name }
            ];
            item.layouts[0] = ''; //P1 Video Centered
            if (isInline) {
              item.layouts[1] = _D3.b.value;
            }
            break;
        }
        break;
      case 'link':
        _displaySelectVisibility(true);
        _imageFieldVisibility(true);
        _templateSelectVisibility(true);
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
            _imageFieldVisibility(true);
            break;
          case EventTemplates.LINK_DESCRIPTION_FIRST_TEMPLATE:
          case EventTemplates.LINK_EMBED_TEMPLATE:
            _imageFieldVisibility(false);
            break;
        }

        break;
      case 'transcript':
        _displaySelectVisibility(false);
        item.layouts[0] = 'inline';
        break;
      case 'annotation':
        item.layouts[0] = 'inline';
        switch (item.component_name) {
          case EventTemplates.HEADER_ONE_TEMPLATE:
          case EventTemplates.HEADER_TWO_TEMPLATE:
            _speakerFieldVisibility(false);
            _titleFieldVisibility(false);
            break;
          case EventTemplates.PULLQUOTE_TEMPLATE:
            _speakerFieldVisibility(true);
            _titleFieldVisibility(false);
            break;
          case EventTemplates.TEXT_TRANSMEDIA_TEMPLATE:
          case EventTemplates.TEXT_DEFINITION_TEMPLATE:
            _speakerFieldVisibility(false);
            _titleFieldVisibility(true);
            break;
        }
        if (item.stop === true) {
          item.layouts[0] = 'windowFg';
        }
        break;
      case 'question':
        _select.questionType = [
          { value: 'mc-poll', name: 'Poll' },
          { value: 'mc-formative', name: 'Formative' }
        ];
        item.layouts[0] = 'windowFg';
        item.stop = true;
        break;
      case 'image':
        //will set to true in image fill
        _displaySelectVisibility(false);
        var _currentSceneName = getSceneName(modelSvc.scene(item.scene_id));
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
            _displaySelectVisibility(true);
            _bgImagePositionSelectVisibility(true);
            _select.imagePosition = [
              { value: 'fill', name: 'Fill and stretch' },
              { value: 'contain', name: 'Contain' },
              { value: 'cover', name: 'Cover and crop' },
              { value: 'tl', name: 'Top Left' },
              { value: 'tr', name: 'Top Right' },
              { value: 'bl', name: 'Bottom Left' },
              { value: 'br', name: 'Bottom Right' },
            ];
            _setAvailableImageOptsForLayout(_currentSceneName, item, itemForm);
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

  function showTab(itemType, tabTitle) {
    switch (itemType) {
      case 'scene':
        switch (tabTitle) {
          case 'Item':
            return false;
          case 'Style':
            return true;
          case 'Customize':
            return _userHasRole('admin');
        }
        break;
      case 'transcript':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return _userHasRole('admin');
        }
        break;
      case 'annotation':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return _userHasRole('admin');
        }
        break;
      case 'link':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return _userHasRole('admin');
        }
        break;
      case 'image':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return _userHasRole('admin');
        }
        break;
      case 'file':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return _userHasRole('admin');
        }
        break;
      case 'question':
        switch (tabTitle) {
          case 'Item':
            return true;
          case 'Style':
            return false;
          case 'Customize':
            return _userHasRole('admin');
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

