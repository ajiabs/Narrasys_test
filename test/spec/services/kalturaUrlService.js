/**
 * Created by githop on 2/8/17.
 */

'use strict';

describe('Service: kalturaUrlservice', function() {

  beforeEach(module('com.inthetelling.story'));

  var kalturaUrlService;

  beforeEach(inject(function(_kalturaUrlService_) {
    kalturaUrlService = _kalturaUrlService_;
  }));

  var input = {
    dynamic: {},
    autoEmbedTag: {},
    autoEmbedUrl: {
      //from our kmc middlebury-test-episode
      https: "https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486581060&cache_st=1486581060&width=560&height=315&flashvars[streamerType]=auto",
      http: "http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486579734&cache_st=1486579734&width=560&height=315&flashvars[streamerType]=auto"
    },
    iframe: {}
  };

  describe('getKalturaObjectFromAutoEmbedURL method', function (){
    it('should have a partnerId key with a valid value', function() {

    })
  });

  xdescribe('parse input method', function() {


    describe('auto embed as url', function() {
      it('should handle auto embed https urls', function() {
        var result = kalturaUrlService.parseInput(input.autoEmbedUrl.https);

        expect(result).toBe(result);
      });

      xit('should handle converting http auto embed urls to https', function() {

        var result = kalturaUrlService.parseInput(input.autoEmbedUrl.http);

        expect(result).toBe()

      });
    });


    describe('auto embed as tag', function() {

    });

    describe('dynamic', function() {

    });

    describe('iframe', function() {

    });

  });
});
