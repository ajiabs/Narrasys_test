/*
 TODO: right now we're re-building the episode structure on every keystroke.  That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval

 TODO: some redundancy with ittItemEditor, esp. in the 'styles'.  I expect the episode styling to drift away from the event styling, though, so letting myself repeat myself repeat myself for now
 */
import dataSvc from '../../services/dataSvc';

ittEpisodeEditor.$inject = [
  '$rootScope',
  '$timeout',
  'appState',
  'modelSvc',
  'dataSvc',
  'authSvc',
  'selectService',
  'playbackService',
  'urlService',
  'episodeTheme'
];

export interface ILangformFlags {
  en: boolean;
  es?: boolean;
  zh?: boolean;
  pt?: boolean;
  fr?: boolean;
  de?: boolean;
  it?: boolean;
}

export default function ittEpisodeEditor(
  $rootScope,
  $timeout,
  appState,
  modelSvc,
  dataSvc,
  authSvc,
  selectService,
  playbackService,
  urlService,
  episodeTheme) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      episode: '=ittEpisodeEditor'
    },
    templateUrl: 'templates/producer/episode.html',
    controller: 'EditController',
    link: function (scope) {

      scope.translationMessage = translationMessage;
      function translationMessage(langArr) {
       var prefix = '';
       var langs = langArr.filter(function(l) {
          if (l.default == undefined) { //jshint ignore:line
            return true;
          } else {
            prefix = 'Translate from ' +  l.code + ' to: ';
            return false;
          }
        }).map(function(l) {
          l = l.code;
          return l;
        }).join(', ');
       return prefix + langs;
      }

      scope.beginBackgroundTranslations = beginBackgroundTranslations;
      function beginBackgroundTranslations(episodeId) {
        dataSvc.beginBackgroundTranslations(episodeId)
          .then(handleSuccess)
          .catch(handleError);

        function handleSuccess(resp) {
          console.log('resp from translations!', resp);
          if (resp.status === 'Request for translations queued') {
            scope.afterTranslationAttempt = resp.status + ', check back later!';
          } else {
            scope.afterTranslationAttempt = 'Something went wrong...';
          }
          scope.doCheckForTranslations = true;
        }

        function handleError(e) {
          console.log('error:', e);
        }
      }

      scope.episodeContainerId = modelSvc.episodes[appState.episodeId].container_id;

      var container = modelSvc.containers[scope.episodeContainerId];
      scope.customer = modelSvc.customers[container.customer_id];

      if (scope.episode.master_asset_id && scope.episode.master_asset_id !== "") {
        scope.masterAsset = modelSvc.assets[scope.episode.master_asset_id];
      }
      scope.uploadStatus = [];
      scope.uneditedEpisode = angular.copy(scope.episode); // in case of cancel.   Must be a copy, not the original!
      scope.itemForm = selectService.setupItemForm(scope.episode.styles, 'episode');

      if (!authSvc.userHasRole('admin') || (scope.masterAsset && /video\/x-/.test(scope.masterAsset.content_type))) {
        scope.masterAssetType = 'WebUrl';
      } else {
        scope.masterAssetType = 'Video';
      }

      // extract episode languages for the form
      scope.langForm = <ILangformFlags> {'en': true, 'es': false, 'zh': false, 'pt': false, 'fr': false, 'de': false, 'it': false};
      for (var j = 0; j < scope.episode.languages.length; j++) {
        scope.langForm[scope.episode.languages[j].code] = true;
      }
      scope.langForm[scope.episode.defaultLanguage] = true;
      scope.languageWatcher = scope.$watch(function () {
        return [scope.langForm, scope.episode.defaultLanguage];
      }, function () {
        var languageCount = 0; // not sure if necessary -- can use languages.length instead?
        var lastSelectedLanguage = ""; // convenience to stuff into default if the old default is no longer valid
        var newLanguages = []; // will replace the existing episode languages array
        for (var lang in scope.langForm) {
          if (scope.langForm[lang]) {
            languageCount++;
            lastSelectedLanguage = lang;
            newLanguages.push({
              'code': lang
            });
          } else {
            // language not selected; remove it as default if it was one
            if (scope.episode.defaultLanguage === lang) {
              scope.episode.defaultLanguage = false;
            }
          }
        }
        scope.languageCount = languageCount;

        // ensure there is a valid default selection:
        if (scope.episode.defaultLanguage === false) {
          scope.episode.defaultLanguage = lastSelectedLanguage;
        }

        // set the default inside in the languages structure:
        angular.forEach(newLanguages, function (lang) {
          if (lang.code === scope.episode.defaultLanguage) {
            lang.default = true;
          }
        });

        scope.episode.languages = angular.copy(newLanguages);
      }, true);

      // Transform changes to form fields for styles into item.styles[]:
      scope.watchStyleEdits = scope.$watch(function () {
        return scope.itemForm;
      }, function () {
        // console.log("itemForm:", scope.itemForm);
        var styles = [];
        for (var styleType in scope.itemForm) {
          if (scope.itemForm[styleType]) {
            styles.push(styleType + scope.itemForm[styleType]);
          }
        }
        scope.episode.styles = styles;
        modelSvc.deriveEpisode(scope.episode);
        modelSvc.resolveEpisodeEvents(scope.episode._id); // needed for template or style changes
      }, true);

      scope.appState = appState;

      // Angular1.3 dependency: watchGroup
      // Deep-watching the entire episode is not so much with the good performance characteristics so we instead only watch the editable fields
      // TODO would it be worth using watchGroup in itemEdit as well?
      scope.watchEdits = scope.$watchGroup(
        // I am kind of amazed that using appState.lang works here, these strings must get recalculated every tick
        [
          'episode.templateUrl',
          'episode.title[appState.lang]',
          'episode.description[appState.lang]',
          'episode.template_id'
        ],
        function (newVal, oldVal) {
          // console.log("DETECTED CHANGE", newVal, oldVal);
          // if (newVal[0] !== oldVal[0]) { // templateUrl
          //   // Some templates have built-in color and typography selections; need to update them along with the template.
          //   // TODO This would be a lot simpler if I hadn't chosen such a dumb structure for style info...
          //   // console.log("Template changed from ", oldVal[0], " to ", newVal[0]);
          //   // console.log(scope.episode.styles);
          //   var fixStyles = [];
          //
          //   //oldVal may be empty if newly created episode
          //   if (oldVal[0]) {
          //     var oldCustomer = oldVal[0].match('templates/episode/(.*).html')[1];
          //     // remove color-oldVal and typography-oldVal.
          //     angular.forEach(scope.episode.styles, function (style) {
          //       if (style.toLowerCase() !== "color" + oldCustomer && style.toLowerCase() !== "typography" + oldCustomer) {
          //         fixStyles.push(style);
          //       }
          //     });
          //   }
          //
          //   var newCustomer = newVal[0].match('templates/episode/(.*).html')[1];
          //   // add color-newVal and typography-newVal (only for ep templates that use this:)
          //   angular.forEach(["eliterate", "gw", "purdue", "usc", "columbia", "columbiabusiness"], function (customer) {
          //     if (newCustomer === customer) {
          //       fixStyles.push("color" + customer[0].toUpperCase() + customer.substring(1));
          //       fixStyles.push("typography" + customer[0].toUpperCase() + customer.substring(1));
          //     }
          //   });
          //   scope.episode.styles = angular.copy(fixStyles);
          //   // console.log("Updated styles:", scope.episode.styles);
          //
          // }
          // scope.episode.template_id = newVal[3];
          // $rootScope.templateId = newVal[3];
          const template = dataSvc.getTemplate(newVal[3]);
          episodeTheme.setTheme(template);
          scope.episode.template_id = template.id;

          modelSvc.deriveEpisode(scope.episode);
          // modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
          modelSvc.resolveEpisodeEvents(scope.episode._id); // needed for template or style changes

        }
      );

      scope.dismissalWatcher = $rootScope.$on("player.dismissAllPanels", scope.cancelEdit);

      scope.cancelEdit = function () {
        // hand off to EditController (with the original to be restored)
        scope.cancelEpisodeEdit(scope.uneditedEpisode);
      };

      scope.attachChosenAsset = function (asset_id) { // master asset only!
        scope.episode.replacingMasterAsset = false;
        var asset = modelSvc.assets[asset_id];
        var previousAsset = modelSvc.assets[scope.episode.master_asset_id];
        scope.showmessage = "New video attached.";
        if (previousAsset && (asset.duration < previousAsset.duration)) {
          var orphans = scope.getItemsAfter(scope.episode.items.concat(scope.episode.scenes), asset.duration);
          if (orphans.length) {
            // TODO i18n
            scope.showmessage = "Warning: this new video is shorter than the current video and we've detected that some existing content items will be impacted. If you save this edit, these events will have their start and end times adjusted to the new episode end. (If this isn't what you want, choose a different video or hit 'cancel'.)";
          }
        }
        scope.episode._master_asset_was_changed = true;
        scope.episode.master_asset_id = asset._id;
        scope.masterAsset = asset;
        scope.episode.masterAsset = asset;
        modelSvc.deriveEpisode(scope.episode);
      };

      scope.attachPosterAsset = function (assetId) {
        var asset = modelSvc.assets[assetId];
        scope.episode.poster_frame_id = assetId;
        scope.episode.poster = asset;
        modelSvc.deriveEpisode(scope.episode);
      };

      scope.assetUploaded = function (assetId) {
        scope.showUploadButtons = false;
        scope.showUploadField = false;
        scope.attachChosenAsset(assetId);
      };
      scope.posterUploaded = function (assetId) {
        scope.showUploadButtonsPoster = false;
        scope.showUploadFieldPoster = false;
        scope.attachPosterAsset(assetId);
      };

      function waitForDuration(onDone, url, type) {
        return function (state) {
          if (state === 'player ready') {
            playbackService.unregisterStateChangeListener(waitForDuration);
            //push to end of event loop.
            $timeout(function () {
              onDone({
                duration: playbackService.getMetaProp('duration', 'replaceMe'),
                url,
                type
              });
              //remove temp
              scope.episode.swap = {};
            }, 0);

          }
        };
      }

      function createAssetFromTmp(tmpAsset) {
        var asset = Object.create(null);
        asset.content_type = tmpAsset.type;
        asset.duration = tmpAsset.duration;
        asset.url = tmpAsset.url;
        asset.name = scope.episode.title;
        asset.description = scope.episode.description;
        dataSvc.createAsset(scope.episodeContainerId, asset).then(function (data) {
          modelSvc.cache('asset', data);
          playbackService.renamePid('replaceMe', data._id);
          scope.attachChosenAsset(data._id);
        }).catch(function (e) {
          console.log('errr', e);
        });
      }

      scope.attachMediaSrc = attachMediaSrc;
      function attachMediaSrc(urlOrEmbedCode) {
        var contentType;
        var pmTypeAndMimeType = urlService.checkUrl(urlOrEmbedCode);
        var type = pmTypeAndMimeType.type;

        if (type === 'wistia' && !authSvc.userHasRole('admin')) {
          return;
        }

        if (type.length > 0) {
          contentType = pmTypeAndMimeType.mimeType;
          scope.episode.replacingMasterAsset = true;
          scope.showmessage = 'Getting ' + type + ' video...';
          var mediaSrcUrl = urlService.parseInput(urlOrEmbedCode);

          scope.episode.swap = {
            _id: 'replaceMe',
            mediaSrcArr: [mediaSrcUrl]
          };

          var afterReady = waitForDuration(createAssetFromTmp, mediaSrcUrl, contentType);
          playbackService.registerStateChangeListener(afterReady);
        }
      }

      scope.replaceAsset = function (assetType) {
        assetType = assetType || '';
        scope["showUploadButtons" + assetType] = true;
        scope["showUploadField" + assetType] = false;
      };

      scope.selectText = function (event) {
        event.target.select(); // convenience for selecting the episode url
      };

      scope.$on('$destroy', function () {
        scope.watchEdits();
        scope.dismissalWatcher();
        scope.languageWatcher();
        scope.watchStyleEdits();
      });
    }
  };
}
