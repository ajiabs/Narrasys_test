// @npUpgrade-inputFields-true
import { IModelSvc } from '../../../interfaces';
import { existy, slugify } from '../../../shared/services/ittUtils';

/**
 * Created by githop on 3/23/17.
 */

export class ValidPathSlug implements ng.IDirective {
  restrict: string = 'A';
  require = ['^ngModel', '^npGuestAccessibleUrl'];
  static Name = 'npValidPathSlug';
  static $inject = ['modelSvc'];

  constructor(private modelSvc: IModelSvc) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = (modelSvc) => new ValidPathSlug(modelSvc);
    directiveInstance.$inject = ValidPathSlug.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: ng.IAttributes, ctrls): void {
    const ngModel = ctrls[0];
    const parentCtrl = ctrls[1];
    const customer = this.modelSvc.customers[parentCtrl.narrative.customer_id] || parentCtrl.customer;

    const pathSlugs = parentCtrl.type === 'narrative' ?
      this.modelSvc.cachedNarrativesByCustomer(customer) :
      parentCtrl.narrative.timelines;

    const id = parentCtrl[parentCtrl.type]._id;


    if (ngModel) {
      ngModel.$validators = {
        validPathslug
      };
    }

    function validPathslug(viewVal) {
      parentCtrl[parentCtrl.type].error = null;

      if (ngModel.$isEmpty(viewVal)) {
        parentCtrl[parentCtrl.type].error = 'Slug cannot be empty';
        return true;
      }

      const asSlug = slugify(viewVal);
      const subdomainSet = _gatherPathSlugs(pathSlugs, id);

      if (subdomainSet.indexOf(asSlug) !== -1) {
        parentCtrl[parentCtrl.type].error = asSlug + ' is already taken.';
      }
      return true;

    }

    function _gatherPathSlugs(pathSlugs, id) {
      return pathSlugs.reduce(
        (slugSet, n) => {
          if (n.path_slug && n.path_slug.en) {
            if (existy(id)) {
              if (id !== n._id) {
                slugSet.push(n.path_slug.en);
                return slugSet;
              }
            } else {
              slugSet.push(n.path_slug.en);
            }
          }
          return slugSet;
        },
        []
      );
    }
  }
}


//this directive currently depends on the parent directive having
//the necessary narrative(s) / timeline(s) data already cached in the modelSvc

ittValidPathslug.$inject = ['modelSvc', 'ittUtils'];
export default function ittValidPathslug(modelSvc, ittUtils) {
  return {
    require: ['^ngModel', '^npGuestAccessibleUrl'],
    restrict: 'EA',
    link: function ittValidPathslugLink(scope, elm, attr, ctrls) {
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
        parentCtrl[parentCtrl.type].error = null;

        if (ngModel.$isEmpty(viewVal)) {
          parentCtrl[parentCtrl.type].error = 'Slug cannot be empty';
          return true;
        }

        var asSlug = _slugify(viewVal);
        var subdomainSet = _gatherPathSlugs(pathSlugs, id);

        if (subdomainSet.indexOf(asSlug) !== -1) {
          parentCtrl[parentCtrl.type].error = asSlug + ' is already taken.';
        }
        return true;

      }

      function _gatherPathSlugs(pathSlugs, id) {
        return pathSlugs.reduce(function (slugSet, n) {
          if (n.path_slug && n.path_slug.en) {
            if (_existy(id)) {
              if (id !== n._id) {
                slugSet.push(n.path_slug.en);
                return slugSet;
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
