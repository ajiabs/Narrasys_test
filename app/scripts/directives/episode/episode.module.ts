import ittEpisode from './ittEpisode';
import ittEpisodeEditor from './ittEpisodeEditor';
import ittEpisodeList from './ittEpisodeList';
import { EpisodeTheme } from './episodeTheme.service';

export const npEpisodeModule = angular.module('npEpisode', [])
  .directive('ittEpisode', ittEpisode)
  .directive('ittEpisodeEditor', ittEpisodeEditor)
  .service(EpisodeTheme.Name, EpisodeTheme)
  .directive('ittEpisodeList', ittEpisodeList);
