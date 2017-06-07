/**
 * Created by githop on 6/6/17.
 */

import {IUploadData} from '../interfaces';

const TEMPLATE = `
directive exists?
<span ng-if="$ctrl.upload != null">
  <span>{{$ctrl.upload.name}}</span>
  <progress
    ng-attr-max="{{$ctrl.upload.bytesTotal}}"
    ng-attr-value="{{$ctrl.upload.bytesSent}}">
  </progress>
</span>
`;

interface IUploadProgressBindings {
  upload: IUploadData
}

// class UploadProgressController implements ng.IComponentController, IUploadProgressBindings {
//   static $inject = [];
//   constructor(){
//
//   }
// }


export class UploadProgress implements ng.IComponentOptions {
  static Name: string = 'ittUploadProgress';
  bindings: any = {
    upload: '<'
  };
  template: string = TEMPLATE;
  // controller: ng.IComponentController = UploadProgressController;
}
