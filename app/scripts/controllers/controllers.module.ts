/**
 * Created by githop on 3/30/17.
 */

import 'angular';

import EditController from '../../shared/services/EditController';
import EventTestController from './EventTestController';
import TimelineController from './TimelineController';

const ittControllers = angular.module('itt.controllers', [])
  .controller('EditController', EditController)
  .controller('EventTestController', EventTestController)
  .controller('TimelineController', TimelineController);

export default ittControllers;
