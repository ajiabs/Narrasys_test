import ittEpisode from './ittEpisode';
import ittEpisodeEditor from './ittEpisodeEditor';
import ittEpisodeList from './ittEpisodeList';
import { EpisodeTheme } from './episodeTheme.service';
import { EpisodeEditService } from './episodeEdit.service';

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
