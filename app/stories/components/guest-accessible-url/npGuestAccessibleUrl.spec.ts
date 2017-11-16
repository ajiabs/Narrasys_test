

import { createInstance, INarrative, ITimeline } from '../../../models';
import { Partial } from '../../../interfaces';

const stubNarrativeGuestAccessible: Partial<INarrative> = createInstance('Narrative', {
  _id: 'testing',
  path_slug: { en: 'guest-accessible-url' },
  narrative_subdomain: 'test',
  guest_access_allowed: true
});

const noSubdomainNarrative: Partial<INarrative> = createInstance('Narrative', {
  _id: 'testing',
  path_slug: { en: 'guest-accessible-url' },
  guest_access_allowed: true
});

const stubNarrative: Partial<INarrative> = createInstance('Narrative', {
  _id: 'testing',
  path_slug: { en: 'guest-accessible-url' },
  narrative_subdomain: 'test',
  guest_access_allowed: false
});

const stubTimeline: Partial<ITimeline> = createInstance('Timeline', {
  _id: 'testing',
  path_slug: { en: 'guest-accessible-timeline' },
  narrative_subdomain: 'test'
});


describe('Component: GuestAccessibleUrl', () => {
  beforeEach(angular.mock.module('np.client'));
  let $componentController;

  describe('npGuestAccessibleUrl for narrative with guest access enabled', () => {
    beforeEach(angular.mock.inject((_$componentController_) => { // tslint:disable-line
      $componentController = _$componentController_('npGuestAccessibleUrl', null, {
        narrative: stubNarrativeGuestAccessible
      });
      $componentController.$onInit();
    }));

    it('formatLTIUrl()', () => {
      expect($componentController.formatLTIUrl()).toBe('https://test.narrasys.com/auth/lti?narrative=testing');
    });

    it('formatGuestAccessibleUrl', () => {
      const url = $componentController.formatGuestAccessibleUrl();
      expect(url).toBe('https://test.narrasys.com/#/story/guest-accessible-url');
    });

    it('formatUrlToCopy', () => {
      const url = $componentController.formatUrlToCopy();
      expect(url).toBe('https://test.narrasys.com/#/story/guest-accessible-url');
    });
  });

  describe('npGuestAccessibleUrl for narrative with guest access disabled', () => {
    beforeEach(angular.mock.inject((_$componentController_) => { // tslint:disable-line
      $componentController = _$componentController_('npGuestAccessibleUrl', null, {
        narrative: stubNarrative
      });
      $componentController.$onInit();
    }));

    it('formatLTIUrl()', () => {
      expect($componentController.formatLTIUrl()).toBe('https://test.narrasys.com/auth/lti?narrative=testing');
    });

    it('formatUrlToCopy', () => {
      const url = $componentController.formatUrlToCopy();
      expect(url).toBe('https://test.narrasys.com/auth/lti?narrative=testing');
    });
  });

  describe('npGuestAccessibleUrl for narrative with no subdomain', () => {
    beforeEach(angular.mock.inject((_$componentController_) => { // tslint:disable-line
      $componentController = _$componentController_('npGuestAccessibleUrl', null, {
        narrative: noSubdomainNarrative
      });
      $componentController.$onInit();
    }));


    it('formatGuestAccessibleUrl() should do stuff', () => {
      const url = $componentController.formatGuestAccessibleUrl();
      expect(url).not.toBe(false);
    });

  });

  describe('npGuestAccessibleUrl for timeline', () => {
    beforeEach(angular.mock.inject((_$componentController_) => { // tslint:disable-line
      $componentController = _$componentController_('npGuestAccessibleUrl', null, {
        narrative: stubNarrative,
        timeline: stubTimeline
      });
      $componentController.$onInit();
    }));

    it('formatLTIUrl()', () => {
      const url = $componentController.formatLTIUrl();
      expect(url).toBe('https://test.narrasys.com/auth/lti?narrative=testing&timeline=testing');
    });

    it('formatGuestAccessibleUrl', () => {
      const url = $componentController.formatGuestAccessibleUrl();
      expect(url).toBe('https://test.narrasys.com/#/story/guest-accessible-url/guest-accessible-timeline');
    });

    it('formatUrlToCopy', () => {
      const url = $componentController.formatUrlToCopy();
      expect(url).toBe('https://test.narrasys.com/auth/lti?narrative=testing&timeline=testing');
    });
  });

});
