/**
 * Created by githop on 3/30/17.
 */

import ittReviewMode from './ittReviewMode';

const directivesModule = angular.module('itt.directives', [])
  .directive('ittReviewMode', ittReviewMode);

export default directivesModule;
