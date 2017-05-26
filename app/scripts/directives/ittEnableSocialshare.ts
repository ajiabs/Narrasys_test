/**
 * Created by githop on 5/26/17.
 */
import {IimageResize, Partial} from '../interfaces';
import {SOCIAL_UPLOAD} from './ittAssetUploader';
/**
 * Created by githop on 5/22/17.
 */

const TEMPLATE = `
<label>Enable social share</label>
<input type="checkbox" ng-model="$ctrl[$ctrl.type].enable_social_sharing"/>
<div ng-if="$ctrl[$ctrl.type].enable_social_sharing">

  <div class="social-images">
    <div class="social-images__img" ng-repeat="(imgType, imgPath) in $ctrl.images">
       <span ng-if="imgPath.path.length > 0">
        Type: {{imgType}}
        <img width="95px" ng-src="{{imgPath.path}}"/>
       </span>
    </div>
    
    <button
      ng-click="$ctrl.sendUploads()"
      ng-if="$ctrl.images.square.path && $ctrl.images.wide.path">Upload images</button>
  </div>

  <itt-asset-uploader
    mimeTypes="image/*"
    on-filedrop="$ctrl.handleImage(data)"
    file-receive="$ctrl.uploads">
  </itt-asset-uploader>
</div>
`;

interface EnableSocialShareBindings {
  narrative: any;
  editorForm: ng.IFormController;
  timeline?: any;
}

interface IImages {
  square: { name:string, path: string, file: FileList | null };
  wide: { name: string, path: string, file: FileList | null };
}

class EnableSocialshareController implements ng.IComponentController, EnableSocialShareBindings {
  narrative;
  timeline;
  editorForm: ng.IFormController;
  //
  images: Partial<IImages> = {
    square: null,
    wide: null,
  };
  uploads = {
    payload: {
      type: SOCIAL_UPLOAD,
      square: null,
      wide: null
    }
  };
  private files = {
    square: {name: '', path: '', file: null},
    wide: {name: '', path: '', file: null}
  };

  private type: 'narrative' | 'timeline';
  static $inject = ['imageResize'];
  constructor(private imageResize: IimageResize){

  }

  $onInit() {
    if (this.timeline == null) {
      this.type = 'narrative';
    } else {
      this.type = 'timeline';
    }
  }

  handleImage(data: FileList): void {
    this.checkAspectRatio(data[0])
      .then(({images, tag}) => {
        this.files[tag].file = data;
        this.files[tag].name = data[0].name;
        this.files[tag].name = data[0].name;

        this.images = Object.assign({}, this.images, images);
      })
      .catch(e => console.log('whoopsies', e));
  }

  sendUploads(): void {
    //using a new object will change the ref thus trigger $onChanges in the
    //asset uploader component


    this.uploads = {
      payload: {
        type: SOCIAL_UPLOAD,
        square: this.files.square,
        wide: this.files.wide
      }
    };
  }



  checkAspectRatio(file: File) {
    this.editorForm.$setValidity(this.editorForm.$name, false, this.editorForm);
    return this.imageResize.readFileToImg(file)
      .then((img: HTMLImageElement) => {
        const tag = this.imageResize.getImageTagType(img.width, img.height);
        const images = {[tag]: {name: file.name, path: img.src } };
        return {images, tag};
      });
  }


}

export class EnableSocialshare implements ng.IComponentOptions {
  static Name: string = 'ittEnableSocialshare';
  bindings: any = {
    narrative: '=',
    editorForm: '=',
    timeline: '=?'
  };
  template: string = TEMPLATE;
  controller: ng.IComponentController = EnableSocialshareController;
}

