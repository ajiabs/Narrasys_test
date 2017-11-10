// @npUpgrade-projects-true
const TEMPLATE = `
<div class="standaloneAncillaryPage">
	<np-nav on-logout="$ctrl.logout()"></np-nav>

	<h1>Projects</h1>
  <np-episode-list class="np-container" context="episode"></np-episode-list>
</div>
`;

interface IProjectsContainerBindings extends ng.IComponentController {
}

class ProjectsContainerController implements IProjectsContainerBindings {
  static $inject = ['authSvc'];
  constructor(private authSvc) {
    //
  }

  $onInit() {
    //
  }

  logout() {
    this.authSvc.logout();
  }
}
export class ProjectsContainer implements ng.IComponentOptions {
  template: string = TEMPLATE;
  controller = ProjectsContainerController;
  static Name: string = 'npProjectsContainer'; // tslint:disable-line
}

