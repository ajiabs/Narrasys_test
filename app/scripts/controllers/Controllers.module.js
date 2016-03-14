/**
 * Created by githop on 12/12/15.
 */

import angular from 'angular';
import EditController from './EditController';
import EpisodeController from './EpisodeController';
import ErrorController from './ErrorController';
import EventTestController from './EventTestController';
import ItemController from './ItemController';
import PlayerController from './PlayerController';
import SceneController from './SceneController';
import SearchPanelController from './SearchPanelController';
import TimelineController from './TimelineController';
import VideoController from './VideoController';
import ContainerAssetsTestController from './ContainerAssetsTestController';
import ittYoutubeCtrl from '../directives/ittYoutubeEmbed';
import ittIframeCtrl from '../directives/ittIframe';

let controllersModule = angular.module('iTT.controllers', [])
	.controller('EditController', EditController)
	.controller('EpisodeController', EpisodeController)
	.controller('ErrorController', ErrorController)
	.controller('EventTestController', EventTestController)
	.controller('ItemController', ItemController)
	.controller('PlayerController', PlayerController)
	.controller('SceneController', SceneController)
	.controller('SearchPanelController', SearchPanelController)
	.controller('TimelineController', TimelineController)
	.controller('ContainerAssetsTestController', ContainerAssetsTestController)
	.controller('VideoController', VideoController);

export default controllersModule;
