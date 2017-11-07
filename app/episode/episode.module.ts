import ittEpisode from './components/np-episode/ittEpisode';
import ittEpisodeEditor from './components/np-episode-editor/ittEpisodeEditor';
import ittEpisodeList from './components/np-episode-list/ittEpisodeList';
import { EpisodeTheme } from './services/episodeTheme.service';
import { EpisodeEditService } from './services/episodeEdit.service';

const npEpisodeModule = angular.module('npEpisode', []);
const services = [
  EpisodeTheme,
  EpisodeEditService
];

services.forEach((service) => {
  npEpisodeModule.service(service.Name, service);
});

npEpisodeModule
  .directive('ittEpisode', ittEpisode)
  .directive('ittEpisodeEditor', ittEpisodeEditor)
  .directive('ittEpisodeList', ittEpisodeList);

export default npEpisodeModule;