// @npUpgrade-shared-true
/**
 * Created by githop on 12/11/15.
 */

const TEMPLATE = `
<div class="loading">
	<div class="spinner">
		<div class="rotating pie"></div>
		<div class="filler pie"></div>
		<div class="mask"></div>
	</div>
	Loading
</div>

`;
export class Loading implements ng.IComponentOptions {
  template: string = TEMPLATE;
  static Name: string = 'npLoading'; // tslint:disable-line
}

