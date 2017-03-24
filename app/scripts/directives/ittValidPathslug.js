/**
 * Created by githop on 3/23/17.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittValidPathslug', ittValidPathslug);

  //this directive currently depends on the parent directive having
  //the necessary narrative(s) / timeline(s) data already cached in the modelSvc

  ittValidPathslug.$inject = ['modelSvc', 'ittUtils'];
  function ittValidPathslug(modelSvc, ittUtils) {
    return {
      require: ['^ngModel', '^ittGuestAccessibleUrl'],
      restrict: 'EA',
      link: function(scope, elm, attr, ctrls) {
        var _slugify = ittUtils.slugify;
        var _existy = ittUtils.existy;
        var ngModel = ctrls[0];
        var parentCtrl = ctrls[1];
        var customer = modelSvc.customers[parentCtrl.narrative.customer_id] || parentCtrl.customer;


        var pathSlugs = parentCtrl.type === 'narrative' ?
          modelSvc.cachedNarrativesByCustomer(customer) :
          parentCtrl.narrative.timelines;

        var id = parentCtrl[parentCtrl.type]._id;

        if (ngModel) {
          ngModel.$validators = {
            validPathslug: validPathslug
          };
        }

        function validPathslug(viewVal) {
          parentCtrl.error = null;

          if (ngModel.$isEmpty(viewVal)) {
            parentCtrl.error = 'Slug cannot be empty';
            return false;
          }

          var asSlug = _slugify(viewVal);
          var subdomainSet = _gatherPathSlugs(pathSlugs, id);

          if (subdomainSet.indexOf(asSlug) !== -1) {
            parentCtrl.error = asSlug + ' is already taken.';
            return false;
          } else {
            return true;
          }
        }

        function _gatherPathSlugs(pathSlugs, id) {
          return pathSlugs.reduce(function(slugSet, n) {
            if (n.path_slug && n.path_slug.en) {
              if (_existy(id)) {
                if (id !== n._id) {
                  slugSet.push(n.path_slug.en);
                  return slugSet
                }
              } else {
                slugSet.push(n.path_slug.en);
              }
            }
            return slugSet;
          }, []);
        }

      }
    };
  }


})();
