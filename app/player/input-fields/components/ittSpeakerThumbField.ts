// @npUpgrade-inputFields-false
/**
 * Created by githop on 6/30/16.
 */
export default function ittSpeakerThumbField() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Speaker thumbnail</div>',
      '	<div class="input" np-upload-producer-template></div>',
      '</div>'
    ].join(' ')
  };
}
