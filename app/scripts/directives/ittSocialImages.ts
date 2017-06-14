/**
 * Created by githop on 6/1/17.
 */

const TEMPLATE = `
<div class="social-images__required-tags">
  <itt-validation-tip text="One 'square' and one 'wide' image required"></itt-validation-tip>
  tags:
  <span
    class="button social-images--tag"
    ng-class="val.path != null ? 'set' : 'unset'"
    ng-repeat="(type, val) in $ctrl.images">
          {{type}}
  </span>
  <span ng-transclude></span>
</div>
<div class="social-images">
  <div class="social-images__img" ng-repeat="(imgType, imgPath) in $ctrl.images">
       <span ng-if="imgPath.path.length > 0">
        <img width="95px" ng-src="{{imgPath.path}}"/>
       </span>
  </div>
</div>
`;

class SocialImagesController implements ng.IComponentController {
  images: any[];
}

export class SocialImages implements ng.IComponentOptions {
  static Name: string = 'ittSocialImages';
  transclude: boolean = true;
  bindings: any = {
    images: '<'
  };
  template: string = TEMPLATE;
  controller: ng.IComponentController = SocialImagesController;
}
