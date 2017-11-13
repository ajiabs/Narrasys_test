/**
 * Created by githop on 3/30/17.
 */

import ittReviewMode from './ittReviewMode';
import ittTimeline from './ittTimeline';

const directivesModule = angular.module('itt.directives', [])
  .directive('ittReviewMode', ittReviewMode)
  .directive('ittTimeline', ittTimeline);

export default directivesModule;
