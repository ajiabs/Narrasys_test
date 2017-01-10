NG_DOCS={
  "sections": {
    "api": "API Documentation"
  },
  "pages": [
    {
      "section": "api",
      "id": "iTT",
      "shortName": "iTT",
      "type": "interface",
      "moduleName": "iTT",
      "shortDescription": "The default namespace / angular module which houses the rest of the application code.",
      "keywords": "angular api application code default houses interface inthetelling itt module namespace nganimate ngroute ngsanitize officially rest story textangular titled verbose"
    },
    {
      "section": "api",
      "id": "iTT.directive:ittIframe",
      "shortName": "ittIframe",
      "type": "directive",
      "moduleName": "iTT",
      "shortDescription": "Directive used to display iframed content",
      "keywords": "aka api appstate content contenttype database directive display event iframe iframed item itt mime object source src text type url"
    },
    {
      "section": "api",
      "id": "iTT.directive:ittItemDetailModal",
      "shortName": "ittItemDetailModal",
      "type": "directive",
      "moduleName": "iTT",
      "shortDescription": "For opening modals with event objects.",
      "keywords": "$scope accepts animated api appstate based bool boolean currently data directive display event forcemodal html invoked item itt ittitem method modal modals object objects opening param passed player resides service sets transition"
    },
    {
      "section": "api",
      "id": "iTT.directive:ittValidateUrl",
      "shortName": "ittValidateUrl",
      "type": "directive",
      "moduleName": "iTT",
      "shortDescription": "Directive used on url inputs to allow custom validation",
      "keywords": "$q allow api belongs custom datasvc directive ea errorsvc inputs item itt itt-validate-url ittutils ngmodel type url validating validation youtubesvc"
    },
    {
      "section": "api",
      "id": "iTT.service:appState",
      "shortName": "appState",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "POJO designed to store application state during app runtime. All values are initiazed as boolean and set to false.",
      "keywords": "$interval agent api app application appstate audio authsvc autoscroll autoscrollblocked background based bit bool boolean booleans bottom buffered bufferedpercent buffering captions class client closed config content corner current currently data default designed destination determines disabled discover displaying don duration edited editepisode editevent enabled episode episodeid episodesegmentid false force foreground future getaccesstoken hacky half handling hasbeenplayed height help helpful hidecaptions ie8 iframe initial initiazed injecting inside interrupt iphone isframed isiphone istouchdevice item itemdetail items itt itt-service-appstate-page itt-service-page kind lang layers load locked main modal mode modes muted narrativeid narratives navpanel object overlay override overwriting paint pane paused pct place play player playhead playing plays pojo portion position preview producer producereditlayer product productloadedas properties question relative relevant reports runtime scene scroll searchpanel seconds segment service set sets speed stay store sxs temporarily time timeline timelineid timelinestate timelinesvc timemultiplier toggle toolbar touch true updated user values video videocontrolsactive videocontrolslocked view viewmode visibility visible volume watch weird width window windowheight windowwidth wrong youtube"
    },
    {
      "section": "api",
      "id": "iTT.service:dataSvc",
      "shortName": "dataSvc",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "Service for hitting API endpoints",
      "keywords": "$http $q $rootscope $routeparams $timeout api app appstate assets authsvc cache check checkxframeopts code comments config create delete didn embed endpoints errorsvc event events expose header hitting ids iframe iframed input inspect inspecting itt layout method mocksvc modelsvc passed post prior questionanswerssvc rest service site store target template things update url website wrap x-frame-options"
    },
    {
      "section": "api",
      "id": "iTT.service:html5PlayerManager",
      "shortName": "html5PlayerManager",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "Implements the PlayerManager interface, wraps HTML5 videos",
      "keywords": "$interval _attacheventlisteners _createmetaobj _drawplayerdiv _emitstatechange _formatplayerstatechangeevent _gethtml5videoobject _getinstance _getplayer _initplayerdiv _onstatechange _player _players abstract abstracts api appropriate array asset attached attaching availble boolean bound buffered buffering callback called calls cb class clean conforms copy copying corresponds create creating current currently data debugging defined destroyinstance determine determines divid effects element elements embed embeds emit emitterid empty ended entire entry event events evetn file files fire format freeze freezemetaprops freezes function functionality getbufferedpercent getcurrenttime getmetaobj getmetaprop getplayerdiv getplayerstate handle handler helper html html5 implements individual input instance instances interacted interface interger invoke itt itt-service-html5playermanager-page itt-service-page ittutils ittvideo listeners loops m3u8 main mainplayer map mapped media mediasrcarr message meta metaobj method methods mp4 mute note number numerical obj object objects onbuffering oncanplay onended onpause onplaying onwaiting optional optionally param pause paused pauseotherplayers percent pid pipe play playback playbackrate playbackservice played player playermanager playermanagers players playerstate playerstatechange playerstates playing prior prop proper properties property props provided quality query rate ready reduces registerstatechangelistener relevant remove removes reports representing requested reset resetplayermanager responds return returns seedplayermanager seek select send service set setmetaprop sets setspeed setting setvolume side side-effect slow source sources speed src statechangecallback stream string strings tag tags time timelinesvc togglemute toggles type ultimately unfreeze unfreezemetaprops unique unregister unregisterstatechangelistener urls val video videoelement videoelm videoobj videos void volume webm wiring wraps youtube yt"
    },
    {
      "section": "api",
      "id": "iTT.service:imageResize",
      "shortName": "imageResize",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "Resize images and convert File Objects into images. Used in practice to resize images client side prior",
      "keywords": "$q _calculatenewdimensions _dataurltoblob _getcontext _resizeimgwithcanvas _setcanvaswh amount anti-aliasing api aspect aws base64 basic blob calculates canvas center centering client context convert converted converts createfilefromdataurl creates data dataurl defaults dimensions element encoded factor file filename height horizontally html5 https idea image imageresize images img input inside integers itt js l137 maintaining maxheight maxwidth method object objects offset optional original param passed practice prior promise properties ratio readfiletoimg rectangle reducing rendered resize resized resizedimg resizeimg resolves returns service set sets side source srcheight srcwidth string stuff target toggle true undefined uploading url var vertically width"
    },
    {
      "section": "api",
      "id": "iTT.service:playbackService",
      "shortName": "playbackService",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "playbackService exports an interface for the timelineSvc and consumes the interfaces exported from",
      "keywords": "$destory $destroy $interval _emitstatechange _getplayermanagerfrommediasrc _handleembeddestroy _id _mainplayerid _onplayerready _playerinterfaces _players _setpid _statechangecb accept aka allowplayback api app array asset blank bound bufferedpercent buffering buttons call called case cb change check clean command commands consumes create createinstance creating data db default derive destroyed determines directive drive duration embed embeds emit emitted emitterid emitting entry episode event events eventually example exported exports fired fires freezemetaprops function getcurrenttime getmetaprop getplayerdiv getplayerstate gettimelinestate handle handles helper initialization input instance interface interfaces interval invoke invokes itt ittvideo left level listener listeners loops main mainplayer mainplayerid mainvideo map mask masterasset media mediasrcarr meta method methods object onready optional param parameter parsedmediasrcarr passed pause pauseotherplayers percent pid play playback playbackrate playbackservice player playerid playermanager playermanagers playerstates playerstates_word playing playvideo prior prop properties property queries query rate ready record registered registerstatechangelistener relevant remove removes reset resetplaybackservice responded restartfn restarting resume return returns saved seedplayer seek service set setmetaprop setspeed settimelinestate setup setvolume side-effects speed startat statechangeevent statechangelistener statechanges statement static store stores string switch syncs time timeline timelinestate timelinesvc timlinesvc togglemute toggleplayback toggling track type ui unfreezemetaprops unique unregisterstatechangelistener upstream urls val video videos void volume wires youtube"
    },
    {
      "section": "api",
      "id": "iTT.service:youTubePlayerManager",
      "shortName": "youTubePlayerManager",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "A service for working with youtube iframes",
      "keywords": "$location _createinstance _createmetaobj _emitstatechange _formatplayerstatechange _getpidfrominstance _getplayerdiv _getytinstance _players _tick _trycommand api app array asset buffered buffering callback called calls cb change changing clear clock command completed copy create cued current currently data debugging defined desired destroy destroyinstance detecting determine determines div divid dom download element embed embedded embeds emiiterid emitted empty ended entire error errors errorsvc event events finished fire fired function getcurrenttime getmetaobj getmetaprop getplayerdiv getter getvideoloadedfraction handler handling html https iframe iframes input instance instances int interacted interaction interface invoke itt ittvideo js level loops main mainplayer manually map mediasrcarr meta metadata metaobj method mute note number numerical obj object objects onerror onplayerqualitychange onplayerstatechange onqualitychange onready onreadycb onstatechange operation optional optionally param parameter pause paused pauseotherplayers percent pick pid play playback playbackrate player playerid players playerstate playerstatechange playerstates playervar playing prior prop properties property props quality qualitychangecb range rate ready register registerstatechangelistener representation representing requested reset resetplayermanager responsible restart resume resumes retrieve return returns running safari seconds seedplayermanager seek seeking seekto server service set setmetaprop setplaybackquality sets setspeed setter setvolume slow source specifies speed statechangecb stops stream string svc target time timelinesvc togglemute toggles type unique unregister unregisterstatechangelistener unstarted urls val video videoid videos void volume working youtube youtubeplayerapi youtubesvc yt ytinstance"
    },
    {
      "section": "api",
      "id": "iTT.service:YTScriptLoader",
      "shortName": "YTScriptLoader",
      "type": "service",
      "moduleName": "iTT",
      "shortDescription": "A service for downloading youtube player scripts",
      "keywords": "$q $timeout api async downloading downloads injecting itt load method player promise returns script scripts service turn www-widgetapi youtube"
    }
  ],
  "apis": {
    "api": true
  },
  "html5Mode": false,
  "editExample": true,
  "startPage": "/api",
  "scripts": [
    "angular.js",
    "angular-animate.js"
  ]
};