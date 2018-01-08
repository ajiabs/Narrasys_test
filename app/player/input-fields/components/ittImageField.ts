// @npUpgrade-inputFields-false
/**
 * Created by githop on 6/30/16.
 */
export default function ittImageField() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field" ng-show="selectService.getVisibility(\'imageUpload\')">',
      '	<div class="label">Image',
      '		<itt-validation-tip ng-if="ittItemForm.itemAsset.$invalid" text="Image is required"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" np-upload-producer-template></div>',
      '</div>'
    ].join(' ')
  };
}
