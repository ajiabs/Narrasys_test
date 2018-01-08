import ittEpisode from './components/episode/ittEpisode';
import ittEpisodeEditor from './components/episode-editor/ittEpisodeEditor';
import { EpisodeTheme } from './services/episodeTheme.service';
import { EpisodeEditService } from './services/episodeEdit.service';
import { Copyright } from './components/copyright/npCopyright';
import { EpisodeFooter } from './components/episode-footer/npEpisodeFooter';

const npEpisodeModule = angular.module('np.episode', []);
const services = [
  EpisodeTheme,
  EpisodeEditService
];

const components = [
  Copyright,
  EpisodeFooter
];

services.forEach((service) => {
  npEpisodeModule.service(service.Name, service);
});

components.forEach((cmp) => {
  npEpisodeModule.component(cmp.Name, new cmp);
});

npEpisodeModule
  .directive('ittEpisode', ittEpisode)
  .directive('ittEpisodeEditor', ittEpisodeEditor);

export default npEpisodeModule;
