/**
 * Created by githop on 6/7/16.
 */

import {IDataSvc, IModelSvc} from '../interfaces';
import {IEvent, IScene} from '../models';
import {existy, intersection} from './ittUtils';

export interface ISelectService {
  getSceneName(scene: IScene): string;
  getSelectOpts(type: string): IOpt[];
  getVisibility(prop: string): boolean;
  setupItemForm(stylesArr, type): any;
  onSelectChange(item: IEvent, itemForm): void;
  showTab(itemType, tabTitle): boolean;
}

interface IOpt {
  value: string;
  name: string;
  isDisabled?: boolean;
}

export class SelectService implements ISelectService {
  private _langOpts: IOpt[] = [
    {value: 'en', name: 'English', isDisabled: false},
    {value: 'es', name: 'Spanish', isDisabled: false},
    {value: 'zh', name: 'Chinese', isDisabled: false},
    {value: 'pt', name: 'Portuguese', isDisabled: false},
    {value: 'fr', name: 'French', isDisabled: false},
    {value: 'de', name: 'German', isDisabled: false},
    {value: 'it', name: 'Italian', isDisabled: false}
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
  //moved into a map because we will need to use this
  //when we are handing updates on background images.
  private _visibility = {
    templateSelect: true,
    imageUpload: false,
    display: false,
    videoPosition: false,
    bgImagePosition: false,
    titleField: true,
    speakerField: true
  };

  private _scenes = {
    centered: 'templates/scene/centered.html',      			//Center 1
    centeredPro: 'templates/scene/centeredPro.html',			//Center 2
    '1col': 'templates/scene/1col.html',						//Center 3
    '2colL': 'templates/scene/2colL.html',						//OLD two cols
    '2colR': 'templates/scene/2colR.html',						//Old Two Cols mirrored
    mirroredTwoCol: 'templates/scene/mirrored-twocol.html', 	//Split 2
    cornerV: 'templates/scene/cornerV.html',               		//Split 1
    centerVV: 'templates/scene/centerVV.html',             		//Split 3
    centerVVMondrian: 'templates/scene/centerVV-Mondrian.html', //Split 4
    cornerH: 'templates/scene/cornerH.html',                    //Split 5
    pip: 'templates/scene/pip.html'                             //Split 6
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
    a: {value: 'showCurrent', name: 'show only current transmedia items'},
    b: {value: '', name: 'Show all transmedia items, highlight current ones'}
  };
  private _D2 = {
    a: {value: 'showCurrent', name: 'Show only current text items'},
    b: {value: '', name: 'Show all text items, highlight current ones'}
  };
  private _D3 = {
    a: {value: 'showCurrent', name: 'Show only current items'},
    b: {value: '', name: 'Show all items, highlight current ones'}
  };

  static $inject = ['authSvc', 'modelSvc', 'dataSvc', 'ittUtils'];
  constructor(
    private authSvc,
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc) {
    //
  }

  getSceneName(scene: IScene): string {
    return Object.keys(this._scenes).filter((key) => {
      return this._scenes[key] === scene.templateUrl;
    })[0];
  }

  getSelectOpts(type: string) {
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
  setupItemForm(stylesArr, type) {
    //global for episode and item
    let _itemFormStub = {
      'transition': '',
      'highlight': '',
      'color': '',
      'typography': '',
      'timestamp': ''
    } as any;
    const _itemSpecificOpts = {
      'position': '' // for image fills only
    };
    //add additional props for items
    if (type === 'item') {
      _itemFormStub = angular.extend(_itemSpecificOpts, _itemFormStub);
    }
    //return stub object if no array is passed.
    if (!existy(stylesArr)) {
      return _itemFormStub;
    }
    // do this in both cases, i.e. for item and episode
    for (const styleType in _itemFormStub) {
      for (let i = 0; i < stylesArr.length; i++) {
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
    for (let j = 0; j < stylesArr.length; j++) {
      if (stylesArr[j] === 'contain' || stylesArr[j] === 'cover' ||
        stylesArr[j] === 'center' || stylesArr[j] === 'fill' ||
        stylesArr[j] === 'tl' || stylesArr[j] === 'tr' ||
        stylesArr[j] === 'bl' || stylesArr[j] === 'br') {
        _itemFormStub.position = stylesArr[j];
      }
    }

    return _itemFormStub;
  }

  getTemplates(type) {
    switch (type) {
      case 'episode':
        const custIds = this.authSvc.getCustomerIdsFromRoles();
        const _reduceTemplates = (accm, curr) => {
          //admins get all templates
          if (this._userHasRole('admin')) {
            if (curr.type === 'Episode') {
              accm.push({url: curr.url, name: curr.displayName});
            }
            return accm;
          } else {
            //return templates with assoc to customer
            if (curr.type === 'Episode' && existy(curr.customerIds)) {
              const hasCustomer = intersection(custIds, curr.customerIds);
              //this customer has an episode template OR the default template
              if (hasCustomer.length > 0 || curr.customerIds.length === 0) {
                accm.push({url: curr.url, name: curr.displayName});
              }
            }
            return accm;
          }
        };

        const _sortAlpha = (a, b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          } else {
            return 0;
          }
        };

        this._titleFieldVisibility(true); // NP-1159
        return this.dataSvc.getTemplates().reduce(_reduceTemplates, []).sort(_sortAlpha);
      case 'scene':
        this._displaySelectVisibility(false);
        this._videoPositionSelectVisibility(false);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const scenes = [ //\u2022 = bullet point
          {url: this._scenes.centered, name: 'Center 1 (+ V\u2022TS\u2022ANT\u2022TM)'},
          {url: this._scenes.centeredPro, name: 'Center 2 (+ V\u2022ANT)'},
          {url: this._scenes['1col'], name: 'Center 3 (V\u2022TS\u2022ANT\u2022TM)'},
          {url: this._scenes.cornerV, name: 'Split 1 (V\u2022TS\u2022ANT | TM)'},
          {url: this._scenes.mirroredTwoCol, name: 'Split 2 (V\u2022TM | TS\u2022ANT)'},
          {url: this._scenes.centerVV, name: 'Split 3 (V\u2022ANT | TM)'},
          {url: this._scenes.centerVVMondrian, name: 'Split 4 (V\u2022ANT | TM Invert)'},
          {url: this._scenes.cornerH, name: 'Split 5 (V\u2022TS\u2022ANT / TM)'},
          {url: this._scenes.pip, name: 'Split 6 (TM / V\u2022TS\u2022ANT)'}
        ];

        if (this._userHasRole('admin')) {
          scenes.push(
            {url: this._scenes['2colL'], name: 'OLD Two Columns'},
            {url: this._scenes['2colR'], name: 'OLD Two Columns (mirrored)'}
          );
        }

        return scenes;
      case 'transcript':
        this._speakerFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        return [
          {url: 'templates/item/transcript.html', name: 'Transcript'}
        ];
      case 'annotation':
        this._speakerFieldVisibility(false);
        this._titleFieldVisibility(false);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        return [
          {url: 'templates/item/text-h1.html', name: 'Header 1'},
          {url: 'templates/item/text-h2.html', name: 'Header 2'},
          {url: 'templates/item/pullquote.html', name: 'Pullquote'},
          // {url: 'templates/item/pullquote-noattrib.html', name: 'Pullquote with attribution'},
          {url: 'templates/item/text-transmedia.html', name: 'Long text (as transmedia)'},
          {url: 'templates/item/text-definition.html', name: 'Definition (as transmedia)'}
        ];
      case 'link':
        this._displaySelectVisibility(true);
        this._videoPositionSelectVisibility(false);
        this._imageFieldVisibility(true);
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const linkTemplates = [
          {url: 'templates/item/link.html', name: 'Link'},
          {url: 'templates/item/link-withimage-notitle.html', name: 'Link - hide title'},
          {url: 'templates/item/link-modal-thumb.html', name: 'Link modal'},
          // {url: 'templates/item/link-withimage.html', name: 'Link with image'},
          {url: 'templates/item/link-embed.html', name: 'Embedded link'}
        ];
        if (this._userHasRole('admin')) {
          linkTemplates.splice(3, 0, {
            url: 'templates/item/link-descriptionfirst.html',
            name: 'Link w/ description first'
          });
        }
        return linkTemplates;
      case 'image':
        this._imageFieldVisibility(true);
        this._displaySelectVisibility(false);
        this._videoPositionSelectVisibility(false);
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        const imgTemplates = [
          {url: 'templates/item/image-plain.html', name: 'Plain Image'},
          {url: 'templates/item/image-inline-withtext.html', name: 'Inline Image with text'},
          {url: 'templates/item/image-caption-sliding.html', name: 'Image with sliding caption'},
          {url: 'templates/item/image-thumbnail.html', name: 'Image thumbnail'},
          {url: 'templates/item/image-fill.html', name: 'Background or video overlay'}
        ];
        return imgTemplates;
      case 'file':
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(false);
        this._bgImagePositionSelectVisibility(false);
        return [
          {url: 'templates/item/file.html', name: 'Uploaded File'}
        ];
      case 'question':
        this._displaySelectVisibility(true);
        this._imageFieldVisibility(true);
        this._titleFieldVisibility(true);
        this._templateSelectVisibility(true);
        this._bgImagePositionSelectVisibility(false);
        return [
          {url: 'templates/item/question-mc.html', name: 'Question'}
        ];
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
        const isInline = item.layouts[0] === 'inline';
        switch (item.templateUrl) {
          case 'templates/scene/centered.html': //centered
          case 'templates/scene/centeredPro.html': //Centered Pro, Hide Transcript & Transmedia
            this._videoPositionSelectVisibility(false);
            this._displaySelectVisibility(false);
            item.layouts[0] = ''; //P1 Video Centered
            item.layouts[1] = this._D1.a.value; //showCurrent;
            break;
          case 'templates/scene/centerVV.html': //Vertical Pro, Hide Transcript
          case 'templates/scene/centerVV-Mondrian.html': //Vertical Pro Mondrian, Hide Transcript
            this._displaySelectVisibility(false);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              {value: 'videoLeft', name: 'Video on Left'},
              {value: 'videoRight', name: 'Video on Right'}
            ];
            item.layouts[1] = this._D1.a.value;
            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
            }
            break;
          case 'templates/scene/cornerV.html': //Corner video, vertical
          case 'templates/scene/cornerH.html': //Corner video, horizontal
          case 'templates/scene/pip.html': //picture in picture
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              {value: 'videoLeft', name: 'Video on Left'},
              {value: 'videoRight', name: 'Video on Right'}
            ];
            this._select.display = [
              {value: this._D1.a.value, name: this._D1.a.name},
              {value: this._D1.b.value, name: this._D1.b.name}
            ];

            if (isInline || item.layouts[0] === '') {
              console.log('we are getting here');
              item.layouts[0] = 'videoLeft'; //P2 video left
              item.layouts[1] = this._D1.a.value;
            }
            break;
          case 'templates/scene/mirrored-twocol.html': // Two Columns (v2 mirrored vert)
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              {value: 'videoLeft', name: 'Video on Left'},
              {value: 'videoRight', name: 'Video on Right'}
            ];
            this._select.display = [
              {value: this._D2.a.value, name: this._D2.a.name},
              {value: this._D2.b.value, name: this._D2.b.name}
            ];

            if (isInline || item.layouts[0] === '') {
              item.layouts[0] = 'videoLeft'; //P2 video left
              item.layouts[1] = this._D2.b.value; //show all + highlight current
            }
            break;
          case 'templates/scene/1col.html': //One Column
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(false);
            this._select.display = [
              {value: this._D3.a.value, name: this._D3.a.name},
              {value: this._D3.b.value, name: this._D3.b.name}
            ];
            item.layouts[0] = ''; //P1 Video Centered
            if (isInline) {
              item.layouts[1] = this._D3.b.value;
            }
            break;
          case 'templates/scene/2colL.html': // Two Columns
          case 'templates/scene/2colR.html': //Two Columns mirrored
            this._displaySelectVisibility(true);
            this._videoPositionSelectVisibility(true);
            this._select.video = [
              {value: '', name: 'Video Centered'},
              {value: 'videoLeft', name: 'Video on Left'},
              {value: 'videoRight', name: 'Video on Right'}
            ];
            this._select.display = [
              {value: this._D3.a.value, name: this._D3.a.name},
              {value: this._D3.b.value, name: this._D3.b.name}
            ];
            if (isInline) {
              item.layouts[0] = ''; //P3
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
          if (item.templateUrl === 'templates/item/link-modal-thumb.html') {
            item.templateUrl = 'templates/item/link-embed.html';
            // angular.forEach(item.templateOpts, function(opt) {
            // 	console.log('opt!!', opt);
            // });
          }
        } else {
          item.layouts[0] = 'inline';
        }

        switch (item.templateUrl) {
          case 'templates/item/link.html':
          case 'templates/item/link-withimage.html':
          case 'templates/item/link-withimage-notitle.html':
          case 'templates/item/link-modal-thumb.html':
            this._imageFieldVisibility(true);
            break;
          case 'templates/item/link-descriptionfirst.html':
          case 'templates/item/link-embed.html':
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
        switch (item.templateUrl) {
          case 'templates/item/text-h1.html':
          case 'templates/item/text-h2.html':
            this._speakerFieldVisibility(false);
            this._titleFieldVisibility(false);
            break;
          case 'templates/item/pullquote-noattrib.html':
          case 'templates/item/pullquote.html':
            this._speakerFieldVisibility(true);
            this._titleFieldVisibility(false);
            break;
          case 'templates/item/text-transmedia.html':
          case 'templates/item/text-definition.html':
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
          {value: 'mc-poll', name: 'Poll'},
          {value: 'mc-formative', name: 'Formative'}
        ];
        item.layouts[0] = 'windowFg';
        item.stop = true;
        break;
      case 'image':
        //will set to true in image fill
        this._displaySelectVisibility(false);
        this._bgImagePositionSelectVisibility(false);
        const _currentSceneName = this.getSceneName(this.modelSvc.scene(item.scene_id));
        switch (item.templateUrl) {
          case 'templates/item/image-plain.html':
          case 'templates/item/image-inline-withtext.html':
          case 'templates/item/image-caption-sliding.html':
          case 'templates/item/image-thumbnail.html':
            //set back to blank when not a BG image.
            itemForm.pin = itemForm.position = '';
            item.layouts[0] = 'inline';
            break;
          case 'templates/item/image-fill.html':
            item.cosmetic = true;
            this._displaySelectVisibility(true);
            this._bgImagePositionSelectVisibility(true);
            this._select.imagePosition = [
              {value: 'fill', name: 'Fill and stretch'},
              {value: 'contain', name: 'Contain'},
              {value: 'cover', name: 'Cover and crop'},
              {value: 'tl', name: 'Top Left'},
              {value: 'tr', name: 'Top Right'},
              {value: 'bl', name: 'Bottom Left'},
              {value: 'br', name: 'Bottom Right'},
            ];
            this._setAvailableImageOptsForLayout(_currentSceneName, item, itemForm);
        }
        if (item.stop === true) {
          item.layouts[0] = 'windowFg';
        }
        break;
      case 'file':
        item.showInlineDetail = false;
        switch (item.templateUrl) {
          case 'templates/item/link.html':
            item.showInlineDetail = true;
            break;
          case 'templates/item/file.html':
          case 'templates/item/link-descriptionfirst.html':
          case 'templates/item/link-modal-thumb.html':
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

  private _userHasRole(role): boolean {
    return this.authSvc.userHasRole(role);
  }

  private _setVisibility(prop, bool): void {
    this._visibility[prop] = bool;
  }

  private _imageFieldVisibility(bool: boolean): void {
    this._setVisibility('imageUpload', bool);
  }

  private _displaySelectVisibility(bool: boolean): void {
    this._setVisibility('display', bool);
  }

  private _videoPositionSelectVisibility(bool: boolean) {
    this._setVisibility('videoPosition', bool);
  }

  private _titleFieldVisibility(bool: boolean) {
    this._setVisibility('titleField', bool);
  }

  private _speakerFieldVisibility(bool: boolean) {
    this._setVisibility('speakerField', bool);
  }

  private _templateSelectVisibility(bool: boolean) {
    this._setVisibility('templateSelect', bool);
  }

  private _bgImagePositionSelectVisibility(bool: boolean) {
    this._setVisibility('bgImagePosition', bool);
  }

  private _setAvailableImageOptsForLayout(sceneType, item, itemForm) {
    //if we are set to the default layout,
    //overwrite it back to an empty array
    const isInline = item.layouts[0] === 'inline';

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
          {value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false},
          {value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false},
          {value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: true},
          {value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: true},
          {value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: true},
          {value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: true}
        ];

        if (isInline) {
          item.layouts = ['windowBg'];
        }

        item.layouts = item.layouts || ['windowBg'];
        itemForm.position = itemForm.position || 'fill'; //P1-A
        break;
      case '1col':
      case 'centered':
        const isAdmin = this._userHasRole('admin');
        this._displaySelectVisibility(true);
        this._select.display = [
          {value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false},
          {value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false},
          {value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: !isAdmin},
          {value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: !isAdmin},
          {value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: true},
          {value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: true},
        ];
        if (isInline) {
          item.layouts = ['windowBg'];
        }
        itemForm.position = itemForm.position || 'fill'; //P1-A
        item.layouts = item.layouts || ['windowBg'];
        break;
      case '2colL':
      case '2colR':
      case 'mirroredTwoCol':
        this._displaySelectVisibility(true);
        this._select.display = [
          {value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false},
          {value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false},
          {value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: false},
          {value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: false},
          {value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: false},
          {value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: false}
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
          {value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: false},
          {value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false},
          {value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: false},
          {value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: false},
          {value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: false},
          {value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: false}
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
          {value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: true},
          {value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false},
          {value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: true},
          {value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: true},
          {value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: false},
          {value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: false}
        ];

        if (isInline) {
          item.layouts = ['altBg'];
        }
        itemForm.position = itemForm.position || 'fill';
        item.layouts = item.layouts || ['altBg'];
        break;
      case 'centerVVMondrian':
        this._select.display = [
          {value: 'windowBg', name: this._bgImageTitles.windowBg, isDisabled: true},
          {value: 'videoOverlay', name: this._bgImageTitles.videoOverlay, isDisabled: false},
          {value: 'mainBg', name: this._bgImageTitles.textBg, isDisabled: false},
          {value: 'mainFg', name: this._bgImageTitles.textFg, isDisabled: false},
          {value: 'altBg', name: this._bgImageTitles.transmediaBg, isDisabled: true},
          {value: 'altFg', name: this._bgImageTitles.transmediaFg, isDisabled: true}
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
}

// selectService.$inject = ['authSvc', 'modelSvc', 'dataSvc', 'ittUtils'];
//
// export default function selectService(authSvc, modelSvc, dataSvc, ittUtils) {
//   var _userHasRole = authSvc.userHasRole;
//   var _existy = ittUtils.existy;
//
//   var _langOpts = [
//     {value: 'en', name: 'English', isDisabled: false},
//     {value: 'es', name: 'Spanish', isDisabled: false},
//     {value: 'zh', name: 'Chinese', isDisabled: false},
//     {value: 'pt', name: 'Portuguese', isDisabled: false},
//     {value: 'fr', name: 'French', isDisabled: false},
//     {value: 'de', name: 'German', isDisabled: false},
//     {value: 'it', name: 'Italian', isDisabled: false}
//   ];
//
//   //select opts map
//   var _select = {
//     video: [],
//     display: [],
//     imagePosition: [],
//     imagePin: [],
//     questionType: [],
//     language: _langOpts
//   };
//   //use visibility map with getVisibility() and component directives
//   var _visibility = {
//     templateSelect: true,
//     imageUpload: false,
//     display: false,
//     videoPosition: false,
//     bgImagePosition: false,
//     titleField: true,
//     speakerField: true
//   };
//
//   //moved into a map because we will need to use this
//   //when we are handing updates on background images.
//   var _scenes = {
//     centered: 'templates/scene/centered.html',      			//Center 1
//     centeredPro: 'templates/scene/centeredPro.html',			//Center 2
//     '1col': 'templates/scene/1col.html',						//Center 3
//     '2colL': 'templates/scene/2colL.html',						//OLD two cols
//     '2colR': 'templates/scene/2colR.html',						//Old Two Cols mirrored
//     mirroredTwoCol: 'templates/scene/mirrored-twocol.html', 	//Split 2
//     cornerV: 'templates/scene/cornerV.html',               		//Split 1
//     centerVV: 'templates/scene/centerVV.html',             		//Split 3
//     centerVVMondrian: 'templates/scene/centerVV-Mondrian.html', //Split 4
//     cornerH: 'templates/scene/cornerH.html',                    //Split 5
//     pip: 'templates/scene/pip.html'                             //Split 6
//   };
//
//   var _bgImageTitles = {
//     windowBg: 'Full window background',
//     videoOverlay: 'Video overlay (16:9)',
//     textBg: 'Text pane background',
//     textFg: 'Text pane foreground',
//     transmediaBg: 'Transmedia pane background',
//     transmediaFg: 'Transmedia pane foreground'
//   };
//
//   var _D1 = {
//     a: {value: 'showCurrent', name: 'show only current transmedia items'},
//     b: {value: '', name: 'Show all transmedia items, highlight current ones'}
//   };
//   var _D2 = {
//     a: {value: 'showCurrent', name: 'Show only current text items'},
//     b: {value: '', name: 'Show all text items, highlight current ones'}
//   };
//   var _D3 = {
//     a: {value: 'showCurrent', name: 'Show only current items'},
//     b: {value: '', name: 'Show all items, highlight current ones'}
//   };
//
//   var _imageFieldVisibility = _partialVis('imageUpload');
//   var _displaySelectVisibility = _partialVis('display');
//   var _videoPositionSelectVisibility = _partialVis('videoPosition');
//   var _titleFieldVisibility = _partialVis('titleField');
//   var _speakerFieldVisibility = _partialVis('speakerField');
//   var _templateSelectVisibility = _partialVis('templateSelect');
//   var _bgImagePositionSelectVisibility = _partialVis('bgImagePosition');
//
//   return {
//     showTab: showTab,
//     onSelectChange: onSelectChange,
//     getTemplates: getTemplates,
//     getVisibility: getVisibility,
//     getSelectOpts: getSelectOpts,
//     setupItemForm: setupItemForm,
//     getSceneName: getSceneName
//   };
//
//   function _setVisibility(prop, bool) {
//     _visibility[prop] = bool;
//   }
//
//   function _partialVis(prop) {
//     return function (bool) {
//       return _setVisibility(prop, bool);
//     };
//   }
//
//   function _setAvailableImageOptsForLayout(sceneType, item, itemForm) {
//     //if we are set to the default layout,
//     //overwrite it back to an empty array
//     var isInline = item.layouts[0] === 'inline';
//
//     //TS-1147 - hide video position for videoOverlay
//     //TS-1139 - all layouts, if vidOverlay, forced to fill/stretch.
//     if (item.layouts.indexOf('videoOverlay') !== -1) {
//       _bgImagePositionSelectVisibility(false);
//       itemForm.position = 'fill';
//     }
//     // altPane = transmedia pane, mainPane = text pane.
//     switch (sceneType) {
//       case 'centeredPro':
//         _displaySelectVisibility(true);
//         _videoPositionSelectVisibility(true);
//         _select.display = [
//           {value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false},
//           {value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false},
//           {value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: true},
//           {value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: true},
//           {value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: true},
//           {value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: true}
//         ];
//
//         if (isInline) {
//           item.layouts = ['windowBg'];
//         }
//
//         item.layouts = item.layouts || ['windowBg'];
//         itemForm.position = itemForm.position || 'fill'; //P1-A
//         break;
//       case '1col':
//       case 'centered':
//         var isAdmin = _userHasRole('admin');
//         _displaySelectVisibility(true);
//         _select.display = [
//           {value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false},
//           {value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false},
//           {value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: !isAdmin},
//           {value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: !isAdmin},
//           {value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: true},
//           {value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: true},
//         ];
//         if (isInline) {
//           item.layouts = ['windowBg'];
//         }
//         itemForm.position = itemForm.position || 'fill'; //P1-A
//         item.layouts = item.layouts || ['windowBg'];
//         break;
//       case '2colL':
//       case '2colR':
//       case 'mirroredTwoCol':
//         _displaySelectVisibility(true);
//         _select.display = [
//           {value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false},
//           {value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false},
//           {value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: false},
//           {value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: false},
//           {value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: false},
//           {value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: false}
//         ];
//
//         if (isInline) {
//           item.layouts = ['mainBg'];
//         }
//         itemForm.position = itemForm.position || 'fill'; //P1-A
//         item.layouts = item.layouts || ['mainBg'];
//         break;
//       case 'cornerV':
//       case 'centerVV':
//       case 'cornerH':
//         _displaySelectVisibility(true);
//         _select.display = [
//           {value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: false},
//           {value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false},
//           {value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: false},
//           {value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: false},
//           {value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: false},
//           {value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: false}
//         ];
//
//         if (isInline) {
//           item.layouts = ['altBg'];
//         }
//
//         itemForm.position = itemForm.position || 'fill'; //P1-A
//         item.layouts = item.layouts || ['altBg'];
//         break;
//       case 'pip':
//         _displaySelectVisibility(true);
//         _select.display = [
//           {value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: true},
//           {value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false},
//           {value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: true},
//           {value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: true},
//           {value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: false},
//           {value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: false}
//         ];
//
//         if (isInline) {
//           item.layouts = ['altBg'];
//         }
//         itemForm.position = itemForm.position || 'fill';
//         item.layouts = item.layouts || ['altBg'];
//         break;
//       case 'centerVVMondrian':
//         _select.display = [
//           {value: 'windowBg', name: _bgImageTitles.windowBg, isDisabled: true},
//           {value: 'videoOverlay', name: _bgImageTitles.videoOverlay, isDisabled: false},
//           {value: 'mainBg', name: _bgImageTitles.textBg, isDisabled: false},
//           {value: 'mainFg', name: _bgImageTitles.textFg, isDisabled: false},
//           {value: 'altBg', name: _bgImageTitles.transmediaBg, isDisabled: true},
//           {value: 'altFg', name: _bgImageTitles.transmediaFg, isDisabled: true}
//         ];
//         if (isInline) {
//           item.layouts = ['mainBg'];
//         }
//         item.layouts = item.layouts || ['mainBg'];
//         itemForm.position = itemForm.position || 'fill';
//         break;
//     }
//
//     if (itemForm.position) {
//       item.styles = [itemForm.position];
//     }
//   }
//
//   //not the display name, but the key of the scene map as string.
//   function getSceneName(scene) {
//     return Object.keys(_scenes).filter(function (key) {
//       return _scenes[key] === scene.templateUrl;
//     })[0];
//   }
//
//   function getSelectOpts(type) {
//     return _select[type];
//   }
//
//   function getVisibility(prop) {
//     return _visibility[prop];
//   }
//
//   /*
//    This logic used to live in ittItemEditor and ittEpisodeEditor and is now consolidated here.
//    These loops seem to be responsible for setting up itemForm from the styles array.
//    itemForm seems to be where we hold style specific data that pertains to events (aka items).
//    itemForm seems to be used mostly in the customize tab and sets color, timestamp, hightlight and transition options.
//    itemForm is also responsible for setting the 'pin' and 'position' props on a background image event.
//    All of the above is parsed from the itemForm (if its set), and read into the item.styles array.
//    When it comes time to persist, the styles array is used in dataSvc#prepItemForStorage,
//    which reads the strings in the styles array and returns the corresponding ID for the entity in the DB.
//
//    We do the inverse of this inside of watchStyleEdits below, which watches the itemForm, and builds up the styles array
//    from the itemForm props. It also formats background URLs.
//    */
//   function setupItemForm(stylesArr, type) {
//     //global for episode and item
//     var _itemFormStub = {
//       "transition": "",
//       "highlight": "",
//       "color": "",
//       "typography": "",
//       "timestamp": "",
//     };
//     var _itemSpecificOpts = {
//       "position": "", // for image fills only
//     };
//     //add additional props for items
//     if (type === 'item') {
//       _itemFormStub = angular.extend(_itemSpecificOpts, _itemFormStub);
//     }
//     //return stub object if no array is passed.
//     if (!_existy(stylesArr)) {
//       return _itemFormStub;
//     }
//     // do this in both cases, i.e. for item and episode
//     for (var styleType in _itemFormStub) {
//       for (var i = 0; i < stylesArr.length; i++) {
//         if (stylesArr[i].substr(0, styleType.length) === styleType) { // begins with styleType
//           _itemFormStub[styleType] = stylesArr[i].substr(styleType.length); // Remainder of stylesArr[i]
//         }
//       }
//     }
//     //next loop only necessary for items, so early return
//     if (type === 'episode') {
//       return _itemFormStub;
//     }
//     //need more stuff to do for items
//     // position and pin don't have a prefix because I was dumb when I planned this
//     for (var j = 0; j < stylesArr.length; j++) {
//       if (stylesArr[j] === 'contain' || stylesArr[j] === 'cover' ||
//         stylesArr[j] === 'center' || stylesArr[j] === 'fill' ||
//         stylesArr[j] === 'tl' || stylesArr[j] === 'tr' ||
//         stylesArr[j] === 'bl' || stylesArr[j] === 'br') {
//         _itemFormStub.position = stylesArr[j];
//       }
//     }
//
//     return _itemFormStub;
//   }
//
//   function getTemplates(type) {
//     switch (type) {
//       case 'episode':
//         var custIds = authSvc.getCustomerIdsFromRoles();
//         var _reduceTemplates = function (accm, curr) {
//           //admins get all templates
//           if (_userHasRole('admin')) {
//             if (curr.type === 'Episode') {
//               accm.push({url: curr.url, name: curr.displayName});
//             }
//             return accm;
//           } else {
//             //return templates with assoc to customer
//             if (curr.type === 'Episode' && _existy(curr.customerIds)) {
//               var hasCustomer = ittUtils.intersection(custIds, curr.customerIds);
//               //this customer has an episode template OR the default template
//               if (hasCustomer.length > 0 || curr.customerIds.length === 0) {
//                 accm.push({url: curr.url, name: curr.displayName});
//               }
//             }
//             return accm;
//           }
//         };
//
//         var _sortAlpha = function (a, b) {
//           if (a.name.toLowerCase() < b.name.toLowerCase()) {
//             return -1;
//           } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
//             return 1;
//           } else {
//             return 0;
//           }
//         };
//         _titleFieldVisibility(true); // NP-1159
//         return dataSvc.getTemplates().reduce(_reduceTemplates, []).sort(_sortAlpha);
//       case 'scene':
//         _displaySelectVisibility(false);
//         _videoPositionSelectVisibility(false);
//         _templateSelectVisibility(true);
//         _bgImagePositionSelectVisibility(false);
//         var scenes = [ //\u2022 = bullet point
//           {url: _scenes.centered, name: 'Center 1 (+ V\u2022TS\u2022ANT\u2022TM)'},
//           {url: _scenes.centeredPro, name: 'Center 2 (+ V\u2022ANT)'},
//           {url: _scenes['1col'], name: 'Center 3 (V\u2022TS\u2022ANT\u2022TM)'},
//           {url: _scenes.cornerV, name: 'Split 1 (V\u2022TS\u2022ANT | TM)'},
//           {url: _scenes.mirroredTwoCol, name: 'Split 2 (V\u2022TM | TS\u2022ANT)'},
//           {url: _scenes.centerVV, name: 'Split 3 (V\u2022ANT | TM)'},
//           {url: _scenes.centerVVMondrian, name: 'Split 4 (V\u2022ANT | TM Invert)'},
//           {url: _scenes.cornerH, name: 'Split 5 (V\u2022TS\u2022ANT / TM)'},
//           {url: _scenes.pip, name: 'Split 6 (TM / V\u2022TS\u2022ANT)'}
//         ];
//
//         if (_userHasRole('admin')) {
//           scenes.push(
//             {url: _scenes['2colL'], name: 'OLD Two Columns'},
//             {url: _scenes['2colR'], name: 'OLD Two Columns (mirrored)'}
//           );
//         }
//
//         return scenes;
//       case 'transcript':
//         _speakerFieldVisibility(true);
//         _templateSelectVisibility(true);
//         _bgImagePositionSelectVisibility(false);
//         return [
//           {url: 'templates/item/transcript.html', name: 'Transcript'}
//         ];
//       case 'annotation':
//         _speakerFieldVisibility(false);
//         _titleFieldVisibility(false);
//         _templateSelectVisibility(true);
//         _bgImagePositionSelectVisibility(false);
//         return [
//           {url: 'templates/item/text-h1.html', name: 'Header 1'},
//           {url: 'templates/item/text-h2.html', name: 'Header 2'},
//           {url: 'templates/item/pullquote.html', name: 'Pullquote'},
//           // {url: 'templates/item/pullquote-noattrib.html', name: 'Pullquote with attribution'},
//           {url: 'templates/item/text-transmedia.html', name: 'Long text (as transmedia)'},
//           {url: 'templates/item/text-definition.html', name: 'Definition (as transmedia)'}
//         ];
//       case 'link':
//         _displaySelectVisibility(true);
//         _videoPositionSelectVisibility(false);
//         _imageFieldVisibility(true);
//         _titleFieldVisibility(true);
//         _templateSelectVisibility(true);
//         _bgImagePositionSelectVisibility(false);
//         var linkTemplates = [
//           {url: 'templates/item/link.html', name: 'Link'},
//           {url: 'templates/item/link-withimage-notitle.html', name: 'Link - hide title'},
//           {url: 'templates/item/link-modal-thumb.html', name: 'Link modal'},
//           // {url: 'templates/item/link-withimage.html', name: 'Link with image'},
//           {url: 'templates/item/link-embed.html', name: 'Embedded link'}
//         ];
//         if (_userHasRole('admin')) {
//           linkTemplates.splice(3, 0, {
//             url: 'templates/item/link-descriptionfirst.html',
//             name: 'Link w/ description first'
//           });
//         }
//         return linkTemplates;
//       case 'image':
//         _imageFieldVisibility(true);
//         _displaySelectVisibility(false);
//         _videoPositionSelectVisibility(false);
//         _titleFieldVisibility(true);
//         _templateSelectVisibility(true);
//         _bgImagePositionSelectVisibility(false);
//         var imgTemplates = [
//           {url: 'templates/item/image-plain.html', name: 'Plain Image'},
//           {url: 'templates/item/image-inline-withtext.html', name: 'Inline Image with text'},
//           {url: 'templates/item/image-caption-sliding.html', name: 'Image with sliding caption'},
//           {url: 'templates/item/image-thumbnail.html', name: 'Image thumbnail'},
//           {url: 'templates/item/image-fill.html', name: 'Background or video overlay'}
//         ];
//         return imgTemplates;
//       case 'file':
//         _titleFieldVisibility(true);
//         _templateSelectVisibility(false);
//         _bgImagePositionSelectVisibility(false);
//         return [
//           {url: 'templates/item/file.html', name: 'Uploaded File'},
//         ];
//       case 'question':
//         _displaySelectVisibility(true);
//         _imageFieldVisibility(true);
//         _titleFieldVisibility(true);
//         _templateSelectVisibility(true);
//         _bgImagePositionSelectVisibility(false);
//         return [
//           {url: 'templates/item/question-mc.html', name: 'Question'}
//         ];
//       case 'chapter':
//         //chapters have no template, but need to do side-effects
//         _titleFieldVisibility(true);
//         break;
//     }
//   }
//
//   function onSelectChange(item, itemForm) {
//     _displaySelectVisibility(false);
//     switch (item.producerItemType) {
//       case 'scene':
//         var isInline = item.layouts[0] === 'inline';
//         switch (item.templateUrl) {
//           case 'templates/scene/centered.html': //centered
//           case 'templates/scene/centeredPro.html': //Centered Pro, Hide Transcript & Transmedia
//             _videoPositionSelectVisibility(false);
//             _displaySelectVisibility(false);
//             item.layouts[0] = ''; //P1 Video Centered
//             item.layouts[1] = _D1.a.value; //showCurrent;
//             break;
//           case 'templates/scene/centerVV.html': //Vertical Pro, Hide Transcript
//           case 'templates/scene/centerVV-Mondrian.html': //Vertical Pro Mondrian, Hide Transcript
//             _displaySelectVisibility(false);
//             _videoPositionSelectVisibility(true);
//             _select.video = [
//               {value: 'videoLeft', name: 'Video on Left'},
//               {value: 'videoRight', name: 'Video on Right'}
//             ];
//             item.layouts[1] = _D1.a.value;
//             if (isInline || item.layouts[0] === '') {
//               item.layouts[0] = 'videoLeft'; //P2 video left
//             }
//             break;
//           case 'templates/scene/cornerV.html': //Corner video, vertical
//           case 'templates/scene/cornerH.html': //Corner video, horizontal
//           case 'templates/scene/pip.html': //picture in picture
//             _displaySelectVisibility(true);
//             _videoPositionSelectVisibility(true);
//             _select.video = [
//               {value: 'videoLeft', name: 'Video on Left'},
//               {value: 'videoRight', name: 'Video on Right'}
//             ];
//             _select.display = [
//               {value: _D1.a.value, name: _D1.a.name},
//               {value: _D1.b.value, name: _D1.b.name}
//             ];
//
//             if (isInline || item.layouts[0] === '') {
//               console.log('we are getting here');
//               item.layouts[0] = 'videoLeft'; //P2 video left
//               item.layouts[1] = _D1.a.value;
//             }
//             break;
//           case 'templates/scene/mirrored-twocol.html': // Two Columns (v2 mirrored vert)
//             _displaySelectVisibility(true);
//             _videoPositionSelectVisibility(true);
//             _select.video = [
//               {value: 'videoLeft', name: 'Video on Left'},
//               {value: 'videoRight', name: 'Video on Right'}
//             ];
//             _select.display = [
//               {value: _D2.a.value, name: _D2.a.name},
//               {value: _D2.b.value, name: _D2.b.name}
//             ];
//
//             if (isInline || item.layouts[0] === '') {
//               item.layouts[0] = 'videoLeft'; //P2 video left
//               item.layouts[1] = _D2.b.value; //show all + highlight current
//             }
//             break;
//           case 'templates/scene/1col.html': //One Column
//             _displaySelectVisibility(true);
//             _videoPositionSelectVisibility(false);
//             _select.display = [
//               {value: _D3.a.value, name: _D3.a.name},
//               {value: _D3.b.value, name: _D3.b.name}
//             ];
//             item.layouts[0] = ''; //P1 Video Centered
//             if (isInline) {
//               item.layouts[1] = _D3.b.value;
//             }
//             break;
//           case 'templates/scene/2colL.html': // Two Columns
//           case 'templates/scene/2colR.html': //Two Columns mirrored
//             _displaySelectVisibility(true);
//             _videoPositionSelectVisibility(true);
//             _select.video = [
//               {value: '', name: 'Video Centered'},
//               {value: 'videoLeft', name: 'Video on Left'},
//               {value: 'videoRight', name: 'Video on Right'}
//             ];
//             _select.display = [
//               {value: _D3.a.value, name: _D3.a.name},
//               {value: _D3.b.value, name: _D3.b.name}
//             ];
//             if (isInline) {
//               item.layouts[0] = ''; //P3
//               item.layouts[1] = _D3.b.value;
//             }
//             break;
//         }
//         break;
//       case 'link':
//         _displaySelectVisibility(true);
//         _imageFieldVisibility(true);
//         _templateSelectVisibility(true);
//         if (item.stop === true) {
//           item.layouts[0] = 'windowFg';
//           //prevent link-modal template from opening on top of stop-item modal
//           if (item.templateUrl === 'templates/item/link-modal-thumb.html') {
//             item.templateUrl = 'templates/item/link-embed.html';
//             // angular.forEach(item.templateOpts, function(opt) {
//             // 	console.log('opt!!', opt);
//             // });
//           }
//         } else {
//           item.layouts[0] = 'inline';
//         }
//
//         switch (item.templateUrl) {
//           case 'templates/item/link.html':
//           case 'templates/item/link-withimage.html':
//           case 'templates/item/link-withimage-notitle.html':
//           case 'templates/item/link-modal-thumb.html':
//             _imageFieldVisibility(true);
//             break;
//           case 'templates/item/link-descriptionfirst.html':
//           case 'templates/item/link-embed.html':
//             _imageFieldVisibility(false);
//             break;
//         }
//
//         break;
//       case 'transcript':
//         _displaySelectVisibility(false);
//         item.layouts[0] = 'inline';
//         break;
//       case 'annotation':
//         item.layouts[0] = 'inline';
//         switch (item.templateUrl) {
//           case 'templates/item/text-h1.html':
//           case 'templates/item/text-h2.html':
//             _speakerFieldVisibility(false);
//             _titleFieldVisibility(false);
//             break;
//           case 'templates/item/pullquote-noattrib.html':
//           case 'templates/item/pullquote.html':
//             _speakerFieldVisibility(true);
//             _titleFieldVisibility(false);
//             break;
//           case 'templates/item/text-transmedia.html':
//           case 'templates/item/text-definition.html':
//             _speakerFieldVisibility(false);
//             _titleFieldVisibility(true);
//             break;
//         }
//         if (item.stop === true) {
//           item.layouts[0] = 'windowFg';
//         }
//         break;
//       case 'question':
//         _select.questionType = [
//           {value: 'mc-poll', name: 'Poll'},
//           {value: 'mc-formative', name: 'Formative'}
//         ];
//         item.layouts[0] = 'windowFg';
//         item.stop = true;
//         break;
//       case 'image':
//         //will set to true in image fill
//         _displaySelectVisibility(false);
//         var _currentSceneName = getSceneName(modelSvc.scene(item.scene_id));
//         switch (item.templateUrl) {
//           case 'templates/item/image-plain.html':
//           case 'templates/item/image-inline-withtext.html':
//           case 'templates/item/image-caption-sliding.html':
//           case 'templates/item/image-thumbnail.html':
//             //set back to blank when not a BG image.
//             itemForm.pin = itemForm.position = '';
//             item.layouts[0] = 'inline';
//             break;
//           case 'templates/item/image-fill.html':
//             item.cosmetic = true;
//             _displaySelectVisibility(true);
//             _bgImagePositionSelectVisibility(true);
//             _select.imagePosition = [
//               {value: 'fill', name: 'Fill and stretch'},
//               {value: 'contain', name: 'Contain'},
//               {value: 'cover', name: 'Cover and crop'},
//               {value: 'tl', name: 'Top Left'},
//               {value: 'tr', name: 'Top Right'},
//               {value: 'bl', name: 'Bottom Left'},
//               {value: 'br', name: 'Bottom Right'},
//             ];
//             _setAvailableImageOptsForLayout(_currentSceneName, item, itemForm);
//         }
//         if (item.stop === true) {
//           item.layouts[0] = 'windowFg';
//         }
//         break;
//       case 'file':
//         item.showInlineDetail = false;
//         switch (item.templateUrl) {
//           case 'templates/item/link.html':
//             item.showInlineDetail = true;
//             break;
//           case 'templates/item/file.html':
//           case 'templates/item/link-descriptionfirst.html':
//           case 'templates/item/link-modal-thumb.html':
//             break;
//         }
//         if (item.stop === true) {
//           item.layouts[0] = 'windowFg';
//         }
//
//         break;
//     }
//   }
//
//   function showTab(itemType, tabTitle) {
//     switch (itemType) {
//       case 'scene':
//         switch (tabTitle) {
//           case 'Item':
//             return false;
//           case 'Style':
//             return true;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'transcript':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'annotation':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'link':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'image':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'file':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'question':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return _userHasRole('admin');
//         }
//         break;
//       case 'chapter':
//         switch (tabTitle) {
//           case 'Item':
//             return true;
//           case 'Style':
//             return false;
//           case 'Customize':
//             return false;
//         }
//     }
//   }
// }
