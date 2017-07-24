
export function ittHideVideoField() {
  return {
    scope: true,
    template: `
<div class="field">
  <div class="label">Hide Video</div>
  <div class="input">
    <input type="checkbox" ng-model="item.hide_video">
  </div>
</div>
    `
  };
}
