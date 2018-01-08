/**
 * Created by githop on 2/8/17.
 */
/* tslint:disable */

const input = {
  dynamic: {
    //from our kmc middlebury-test-episode
    https: '<script src="https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751"></script> <div id="kaltura_player_1486590843" style="width: 560px; height: 315px;"></div> <script> kWidget.embed({ "targetId": "kaltura_player_1486590843", "wid": "_2166751", "uiconf_id": 37947851, "flashvars": { "streamerType": "auto" }, "cache_st": 1486590843, "entry_id": "0_aohl11vg" }); </script>',
    http: '<script src="http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751"></script> <div id="kaltura_player_1486590887" style="width: 560px; height: 315px;"></div> <script> kWidget.embed({ "targetId": "kaltura_player_1486590887", "wid": "_2166751", "uiconf_id": 37947851, "flashvars": { "streamerType": "auto" }, "cache_st": 1486590887, "entry_id": "0_aohl11vg" }); </script>',
    bobRoss: '<script src="https://cdnapisec.kaltura.com/p/351361/sp/35136100/embedIframeJs/uiconf_id/11975631/partner_id/351361"></script><div id="kaltura_player_1485191873" style="width: 560px; height: 315px;"></div> <script>kWidget.embed({"targetId": "kaltura_player_1379095684","wid": "_351361","uiconf_id" : "11975631","entry_id" : "1_rfj4zdka","flashvars":{"autoPlay": false},"params":{"wmode": "transparent"}}); </script>'
  },
  autoEmbedTag: {
    //from our kmc middlebury-test-episode
    https: '<script src="https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486590745&cache_st=1486590745&width=560&height=315&flashvars[streamerType]=auto"></script>',
    http: '<script src="http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486590780&cache_st=1486590780&width=560&height=315&flashvars[streamerType]=auto"></script>'
  },
  autoEmbedUrl: {
    //from the google doc
    a: 'https://cdnapisec.kaltura.com/p/351361/sp/35136100/embedIframeJs/uiconf_id/11975631/partner_id/351361%3Fentry_id=1_rfj4zdka%26playerId=kaltura_player_1379095684%26autoembed=true%26width=1024%26height=768%26',
    //from our kmc middlebury-test-episode
    https: 'https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486581060&cache_st=1486581060&width=560&height=315&flashvars[streamerType]=auto',
    http: 'http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?autoembed=true&entry_id=0_aohl11vg&playerId=kaltura_player_1486579734&cache_st=1486579734&width=560&height=315&flashvars[streamerType]=auto',
    bobRoss: 'https://cdnapisec.kaltura.com/p/351361/sp/35136100/embedIframeJs/uiconf_id/11975631/partner_id/351361%3Fentry_id=1_rfj4zdka%26playerId=kaltura_player_1379095684%26autoembed=true%26width=1024%26height=768%26'
  },
  iframe: {
    //from our kmc middlebury-test-episode
    https: '<iframe src="https://cdnapisec.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?iframeembed=true&playerId=kaltura_player_1486590953&entry_id=0_aohl11vg&flashvars[streamerType]=auto" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>',
    http: '<iframe src="http://cdnapi.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?iframeembed=true&playerId=kaltura_player_1486590927&entry_id=0_aohl11vg&flashvars[streamerType]=auto" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>',
    www: '<iframe src="http://www.kaltura.com/p/2166751/sp/216675100/embedIframeJs/uiconf_id/37947851/partner_id/2166751?iframeembed=true&playerId=kaltura_player_1486590927&entry_id=0_aohl11vg&flashvars[streamerType]=auto" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"></iframe>'
  },
  wildCards: {
    http: 'http://',
    empty: ''
  }
};

describe('\nService: kalturaUrlservice -\n', () => {
  beforeEach(angular.mock.module('np.client'));
  let kalturaUrlService;
  beforeEach(angular.mock.inject((_kalturaUrlService_) => {
    kalturaUrlService = _kalturaUrlService_;
  }));


  describe('\tgetKalturaObject()\n\t\t', function () {
    Object.keys(input)
      .forEach(function (key) {
        Object.keys(input[key])
          .forEach(function (type) {
            it(key + ' ' + type + ': should make a kaltura object with these properties: uiconfId, partnerId, entryId, uniqueId', function () {
              const ktObj = kalturaUrlService.getKalturaObject(input[key][type]);
              expect(ktObj.uiconfId).not.toBe(null);
              expect(ktObj.partnerId).not.toBe(null);
              expect(ktObj.entryId).not.toBe(null);
              expect(ktObj.uniqueObjId).not.toBe(null);
            });
          })
      });
  });

  describe('\tparseMediaSrc', function () {
    Object.keys(input)
      .forEach(function (key) {
        Object.keys(input[key])
          .forEach(function (type) {

            it(key + ' ' + type + ': it should handle determing the type of the URL to be kaltura', function () {
              const medaSrc = kalturaUrlService.parseMediaSrc([input[key][type]]);
              expect(medaSrc.type).toBe('kaltura');
            });

          });
      });
  });

});
