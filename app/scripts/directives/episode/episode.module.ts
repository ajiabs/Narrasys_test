import ittEpisode from './ittEpisode';
import ittEpisodeEditor from './ittEpisodeEditor';
import ittEpisodeList from './ittEpisodeList';
import { CssScriptLoader } from './cssScriptLoader.service';

export const npEpisodeModule = angular.module('npEpisode', [])
  .directive('ittEpisode', ittEpisode)
  .directive('ittEpisodeEditor', ittEpisodeEditor)
  .service(CssScriptLoader.Name, CssScriptLoader)
  .directive('ittEpisodeList', ittEpisodeList);
