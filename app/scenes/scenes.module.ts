import ittScene from './components/scene/ittScene';
import SceneController from './components/scene/SceneController';
import { CenterVvTemplate } from './templates/center-vv/center-vv.template';
import { CenterVvMondrianTemplate } from './templates/center-vv-mondrian/center-vv-mondrian.template';
import { CenteredTemplate } from './templates/centered/centered.template';
import { CenteredProTemplate } from './templates/centered-pro/centered-pro.template';
import { CornerHTemplate } from './templates/corner-h/corner-h.template';
import { CornerVTemplate } from './templates/corner-v/corner-v.template';
import { EndingscreenTemplate } from './templates/endingscreen/endingscreen.template';
import { LandingscreenTemplate } from './templates/landingscreen/landingscreen.template';
import { MirroredTwocolTemplate } from './templates/mirrored-twocol/mirrored-twocol.template';
import { OnecolTemplate } from './templates/one-col/onecol.template';
import { PipTemplate } from './templates/pip/pip.template';

const npSceneModule = angular.module('np.scene', []);

const templates = [
  CenterVvTemplate,
  CenterVvMondrianTemplate,
  CenteredTemplate,
  CenteredProTemplate,
  CornerHTemplate,
  CornerVTemplate,
  EndingscreenTemplate,
  LandingscreenTemplate,
  MirroredTwocolTemplate,
  OnecolTemplate,
  PipTemplate
];

npSceneModule
  .directive('ittScene', ittScene)
  .controller('SceneController', SceneController);

templates.forEach((svc: any) => {
  npSceneModule.directive(svc.Name, svc.factory());
});

export default npSceneModule;
