/**
 * Created by githop on 6/6/17.
 */

import {IUploadData} from '../interfaces';

const TEMPLATE = `

<div class="upload-progress" ng-if="$ctrl.upload != null">
  <h5>{{$ctrl.upload.name}} - {{$ctrl.upload.percent}}%</h5>
  <progress
    ng-attr-max="{{$ctrl.upload.bytesTotal}}"
    ng-attr-value="{{$ctrl.upload.bytesSent}}">
  </progress>
</div>

<!--<div class="upload-progress">-->
  <!--<p>File name! - 80%</p>-->
  <!--<progress max="10" value="8"></progress>-->
<!--</div>-->

`;

export class UploadProgress implements ng.IComponentOptions {
  static Name: string = 'ittUploadProgress';
  bindings: any = {
    upload: '<'
  };
  template: string = TEMPLATE;
}
