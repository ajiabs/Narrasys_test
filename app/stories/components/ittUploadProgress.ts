// @npUpgrade-stories-true
/**
 * Created by githop on 6/6/17.
 */

const TEMPLATE = `

<div class="upload-progress" ng-if="$ctrl.upload != null">
  <h5>{{$ctrl.upload.name}} - {{$ctrl.upload.percent}}%</h5>
  <progress
    ng-attr-max="{{$ctrl.upload.bytesTotal}}"
    ng-attr-value="{{$ctrl.upload.bytesSent}}">
  </progress>
</div>

`;

export class UploadProgress implements ng.IComponentOptions {
  bindings: any = {
    upload: '<'
  };
  template: string = TEMPLATE;
  static Name: string = 'ittUploadProgress'; // tslint:disable-line
}
