
describe('Component: npCopyright', () => {
  beforeEach(angular.mock.module('iTT'));
  let $componentController;

  describe('itt copyright', () => {
    beforeEach(angular.mock.inject((_$componentController_) => { // tslint:disable-line
      $componentController = _$componentController_('npCopyright', null, {
        org: 'itt'
      });
    }));

    it('org should be telling story', () => {
      expect(`${$componentController.copyrightOrg} ${$componentController.orgLinkText}`)
        .toBe('TELLING STORY IN THE TELLING');
    });
  });


  describe('Narrasys copyright', () => {

    beforeEach(angular.mock.inject((_$componentController_) => { // tslint:disable-line
      $componentController = _$componentController_('npCopyright', null, {
        org: 'np'
      });
    }));

    it('org should be Narrasys', () => {
      expect(`${$componentController.copyrightOrg} ${$componentController.orgLinkText}`)
        .toBe('Narrative Narrasys');
    });

  });
});
