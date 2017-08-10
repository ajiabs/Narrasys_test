/**
 * Created by githop on 3/30/17.
 */

import 'angular';

import ContainerAssetsTestController from './ContainerAssetsTestController';
import EditController from './EditController';
import EpisodeController from './EpisodeController';
import ErrorController from './ErrorController';
import EventTestController from './EventTestController';
import ItemController from './ItemController';
import NarrativeCtrl from './NarrativeController';
import NarrativesCtrl from './NarrativesController';
import PlayerController from './PlayerController';
import SceneController from './SceneController';
import SearchPanelController from './SearchPanelController';
import TimelineController from './TimelineController';

let ittControllers = angular.module('itt.controllers', [])
  .controller('EditController', EditController)
  .controller('ErrorController', ErrorController)
  .controller('EventTestController', EventTestController)
  .controller('ItemController', ItemController)
  .controller('NarrativeCtrl', NarrativeCtrl)
  .controller('NarrativesCtrl', NarrativesCtrl)
  .controller('PlayerController', PlayerController)
  .controller('SceneController', SceneController)
  .controller('SearchPanelController', SearchPanelController)
  .controller('TimelineController', TimelineController)
  .controller('ContainerAssetsTestController', ContainerAssetsTestController);

export default ittControllers;
