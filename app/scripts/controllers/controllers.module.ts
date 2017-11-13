/**
 * Created by githop on 3/30/17.
 */

import 'angular';

import TimelineController from './TimelineController';

const ittControllers = angular.module('itt.controllers', [])
  .controller('TimelineController', TimelineController);

export default ittControllers;
