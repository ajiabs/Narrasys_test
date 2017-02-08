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
    dynamic: {
      //from our kmc middlebury-test-episode
      https: '<script src="https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751"></script> <div id="kaltura_player_1486590843" style="width: 560px; height: 315px;"></div> <script> kWidget.embed({ "targetId": "kaltura_player_1486590843", "wid": "_2166751", "uiconf_id": 37947851, "flashvars": { "streamerType": "auto" }, "cache_st": 1486590843, "entry_id": "0_aohl11vg" }); </script>',
      http: '<script src="http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751"></script> <div id="kaltura_player_1486590887" style="width: 560px; height: 315px;"></div> <script> kWidget.embed({ "targetId": "kaltura_player_1486590887", "wid": "_2166751", "uiconf_id": 37947851, "flashvars": { "streamerType": "auto" }, "cache_st": 1486590887, "entry_id": "0_aohl11vg" }); </script>'
    },
    autoEmbedTag: {
      //from our kmc middlebury-test-episode
      https: '<script src="https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486590745&cache_st=1486590745&width=560&height=315&flashvars[streamerType]=auto"></script>',
      http: '<script src="http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486590780&cache_st=1486590780&width=560&height=315&flashvars[streamerType]=auto"></script>'
    },
    autoEmbedUrl: {
      //from the google doc
      a: "https://cdnapisec.kaltura.com/p/351361/sp/35136100/embedIframeJs/uiconf_id/11975631/partner_id/351361%3Fentry_id=1_rfj4zdka%26playerId=kaltura_player_1379095684%26autoembed=true%26width=1024%26height=768%26",
      //from our kmc middlebury-test-episode
      https: "https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486581060&cache_st=1486581060&width=560&height=315&flashvars[streamerType]=auto",
      http: "http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486579734&cache_st=1486579734&width=560&height=315&flashvars[streamerType]=auto",
      bobRoss: "https://cdnapisec.kaltura.com/p/351361/sp/35136100/embedIframeJs/uiconf_id/11975631/partner_id/351361%3Fentry_id=1_rfj4zdka%26playerId=kaltura_player_1379095684%26autoembed=true%26width=1024%26height=768%26"
    },
    iframe: {
      //from our kmc middlebury-test-episode
      https: '<iframe src="https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?iframeembed=true&playerId=kaltura_player_1486590953&entry_id=0_aohl11vg&flashvars[streamerType]=auto" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>',
      http: '<iframe src="http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?iframeembed=true&playerId=kaltura_player_1486590927&entry_id=0_aohl11vg&flashvars[streamerType]=auto" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>'
    }
  };


  describe('\tgetKalturaObject method\n\t\t', function (){

    Object.keys(input)
      .forEach(function(key) {
        Object.keys(input[key])
          .forEach(function(type) {

            it(key + ' ' + type + ': should have a partnerId field with a not null', function() {
              var ktObj = kalturaUrlService.getKalturaObject(input[key][type]);
              expect(ktObj.partnerId).not.toBe(null);
            });

            it(key + ' ' + type + ': should have a uiconfId field with a not null value', function () {
              var ktObj = kalturaUrlService.getKalturaObject(input[key][type]);
              expect(ktObj.uiconfId).not.toBe(null);
            });

            it(key + ' ' + type + ': should have a entryId field with a not null value', function() {
              var ktObj = kalturaUrlService.getKalturaObject(input[key][type]);
              expect(ktObj.entryId).not.toBe(null);
            });

            it(key + ' ' + type + ': should have a uniqueObjId field with a not null value', function() {
              var ktObj = kalturaUrlService.getKalturaObject(input[key][type]);
              expect(ktObj.uniqueObjId).not.toBe(null);
            });

          })
      });
  });

  // describe('parse input method', function() {
  //
  //
  //   describe('auto embed as url', function() {
  //     it('should handle auto embed https urls', function() {
  //       var result = kalturaUrlService.parseInput(input.autoEmbedUrl.https);
  //
  //       expect(result).toBe(result);
  //     });
  //
  //     xit('should handle converting http auto embed urls to https', function() {
  //
  //       var result = kalturaUrlService.parseInput(input.autoEmbedUrl.http);
  //
  //       expect(result).toBe()
  //
  //     });
  //   });
  //
  //
  //   describe('auto embed as tag', function() {
  //
  //   });
  //
  //   describe('dynamic', function() {
  //
  //   });
  //
  //   describe('iframe', function() {
  //
  //   });
  //
  // });
});
