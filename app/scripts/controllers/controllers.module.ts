/**
 * Created by githop on 3/30/17.
 */

import 'angular';

import ContainerAssetsTestController from './ContainerAssetsTestController';
import EditController from './EditController';
import ErrorController from './ErrorController';
import EventTestController from './EventTestController';
import TimelineController from './TimelineController';

const ittControllers = angular.module('itt.controllers', [])
  .controller('EditController', EditController)
  .controller('ErrorController', ErrorController)
  .controller('EventTestController', EventTestController)
  .controller('TimelineController', TimelineController)
  .controller('ContainerAssetsTestController', ContainerAssetsTestController);

export default ittControllers;
