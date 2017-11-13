const TEMPLATE = `
<div class="standaloneAncillaryPage">
	<np-nav on-logout="$ctrl.logout()"></np-nav>
	<div>
		<sxs-container-assets container-id="{{$ctrl.containerId}}" mime-key="assetLib"></sxs-container-assets>
	</div>
</div>
`;

interface IAssetsResolveBindings extends ng.IComponentController {

}
class AssetsResolveController implements IAssetsResolveBindings {
  containerId: string;
  static $inject = ['$routeParams', 'authSvc'];
  constructor(private $routeParams, private authSvc) {
    //
  }

  $onInit() {
    this.containerId = this.$routeParams.containerId;
  }

  logout() {
    this.authSvc.logout();
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class AssetsResolve implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = AssetsResolveController;
  static Name: string = 'npAssetsResolve'; // tslint:disable-line
}
