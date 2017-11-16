// @npUpgrade-item-false
/*
 NOTE: when authoring templates make sure that outgoing links call the outgoingLink() function,
 so they get logged properly: don't draw plain hrefs
 */
import { IValidationSvc } from '../../../interfaces';
import { EventTemplates } from '../../../constants';

ittItem.$inject = ['$http', '$timeout', '$interval', 'config', 'authSvc', 'appState', 'analyticsSvc', 'timelineSvc', 'modelSvc', 'selectService', 'playbackService', 'urlService', 'validationSvc'];

export default function ittItem($http, $timeout, $interval, config, authSvc, appState, analyticsSvc, timelineSvc, modelSvc, selectService, playbackService, urlService, validationSvc: IValidationSvc) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      item: '=ittItem'
    },
    template: (el: JQuery, attrs: any) => {
      let componentName;
      if (attrs.forcetemplate) {
        componentName = attrs.forcetemplate;
      } else {
        componentName = '{{item.component_name}}';
      }
      return `<div np-dynamic-event-template component-name="${componentName}"></div>`;
    },
    controller: 'ItemController',
    link: function (scope, element) {
      //scope.user = appState.user;

      scope.appState = appState; // to get searchText
      scope.userHasRole = authSvc.userHasRole;

      if (scope.item.avatar_id) {
        scope.item.avatar = modelSvc.assets[scope.item.avatar_id];
      }

      if (scope.item._id === 'internal:editing') {
        element.addClass('noTransitions');
      } else {
        if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin') || scope.item.user_id === appState.user._id) {
          scope.item.editableByThisUser = true;
        }
      }

      scope.handleOutgoingLinkDisplay = handleOutgoingLinkDisplay;
      function handleOutgoingLinkDisplay(): boolean {
        if (scope.item.url != null && scope.item.url_status != null && scope.item.target != null) {
          let {url, target, url_status} = scope.item;
          let isMixedContent = validationSvc.mixedContentUrl(url);
          let canEmbed = validationSvc.urlIsEmbeddable(url, url_status);
          //open in new tab
          return (!canEmbed || target === '_blank') || isMixedContent;
        }
      }

      scope.toggleDetailView = function () {
        // console.log("Item toggleDetailView");
        if (scope.item.showInlineDetail) {
          // if inline detail view is visible, close it. (If a modal is visible, this is inaccessible anyway, so no need to handle that case.)
          scope.item.showInlineDetail = false;
        } else {
          timelineSvc.pause();

          scope.captureInteraction();
          if (element.width() > 450) {
            // show detail inline if there's room for it:
            scope.item.showInlineDetail = true;
          } else {
            // otherwise pop a modal:
            appState.itemDetail = {item: scope.item, animate: true};
          }
        }
      };
      var KeyCodes = {
        ENTER: 13,
        SPACE: 32
      };

      scope.toggleDetailOnKeyPress = function ($event) {
        var e = $event;
        var passThrough = true;
        switch (e.keyCode) {
          case KeyCodes.ENTER:
            scope.toggleDetailView();
            passThrough = false;
            break;
          case KeyCodes.SPACE:
            scope.toggleDetailView();
            passThrough = false;
            break;
          default:
            passThrough = true;
            break;
        }
        if (!passThrough) {
          $event.stopPropagation();
          $event.preventDefault();
        }
      };

      scope.forceModal = function (doAnimate) {
        if (doAnimate === undefined) {
          doAnimate = true;
        }
        timelineSvc.pause();
        appState.itemDetail = {item: scope.item, animate: doAnimate};
      };

      scope.outgoingLinkOnKeyPress = function (url, $event) {
        var e = $event;
        var passThrough = true;
        switch (e.keyCode) {
          case KeyCodes.ENTER:
            scope.outgoingLink(url);
            passThrough = false;
            break;
          case KeyCodes.SPACE:
            scope.outgoingLink(url);
            passThrough = false;
            break;
          default:
            passThrough = true;
            break;
        }
        if (!passThrough) {
          $event.stopPropagation();
          $event.preventDefault();
        }
      };
      scope.outgoingLink = function (url) {
        timelineSvc.pause();
        scope.captureInteraction();

        //check to see if item URL is from a video; i.e. youtube or html5
        //then do the right thing; i.e. ensure linked to video resumes from
        //current time.
        if (urlService.isVideoUrl(url)) {
          playbackService.pause(scope.item._id);
          var curTime = Math.floor(playbackService.getCurrentTime(scope.item._id)) || 0;
          url = urlService.getOutgoingUrl(url, curTime);
        }

        if (scope.item.targetTop) {
          $timeout(function () {
            window.location.href = url;
          });
        } else {
          window.open(url);
        }
      };

      scope.editItem = function () {
        appState.editEvent = scope.item;
        appState.editEvent.templateOpts = selectService.getTemplates(scope.item.producerItemType);
        //second arg to onSelectChange is the itemForm, which is created in ittItemEditor and
        //we do not have access here. Note that itemForm is only really used in background Images.
        //hack fix is to pass in an empty object, and selectService will add the necessary itemForm
        //props.

        var itemForm = selectService.setupItemForm(appState.editEvent.styles, 'item');

        selectService.onSelectChange(appState.editEvent, itemForm);
        appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
        appState.videoControlsLocked = true;
      };

      scope.captureInteraction = function () {
        analyticsSvc.captureEventActivity("clicked", scope.item._id);
      };

      // HACK: need to capture embedded links on item enter, since they're automatically 'clicked'
      // TODO timelineSvc should be able to inform the item directive directly that enter or exit has happened, $watch is silly
      if (scope.item.component_name === EventTemplates.LINK_EMBED_TEMPLATE) {
        var captureEmbed = scope.$watch(function () {
          return playbackService.getMetaProp('time') > scope.item.start_time;
        }, function (x) {
          if (x) {
            scope.captureInteraction();
            captureEmbed();
          }
        });

      }

      // HACK not sure why but modelSvc.resolveEpisodeAssets isn't always doing the job.
      // (Possibly a race condition?)  Quick fix here to resolve it:
      if (scope.item.asset_id && !scope.item.asset) {
        scope.item.asset = modelSvc.assets[scope.item.asset_id];
      }

      // TODO make credly badge its own directive instead of including it here
      if (scope.item.data) {
        scope.plugin = scope.item.data._plugin;
        scope.plugin._type = scope.item.data._pluginType;

        // BEGIN credly badge
        if (scope.plugin._type === 'credlyBadge') {
          // console.log("credly");
          // have analytics record that this event has been reached, so it can be used as a trigger for other achievements
          analyticsSvc.captureEventActivity("viewed", scope.item._id);
          if (appState.user.roles && appState.user.roles.length === 1 && appState.user.roles[0] === "guest") {
            scope.plugin.eligibleForBadges = false;
          } else {
            scope.plugin.eligibleForBadges = true;
            if (appState.user.emails) {
              scope.plugin.userEmail = appState.user.emails[0];
            } else {
              scope.plugin.userEmail = '';
            }
            scope.plugin.totalAchieved = 0;
          }

          scope.checkBadgeEligibility = function () {
            // console.log('checkBadgeEligibility');
            if (!scope.plugin.eligibleForBadges) {
              return;
            }

            angular.forEach(scope.plugin.requirements, function (req) {
              if (!req.achieved) {
                analyticsSvc.readEventActivity(req.eventId, req.activity)
                  .then(function (achieved) {
                    req.achieved = achieved;
                    scope.countAchievements(); // can't just do totalAchieved++ here: .then() happens asynch to the forEach, so scoping problems
                  });
              }
              scope.countAchievements(); // catch the case where all were already marked
            });
          };

          scope.countAchievements = function () {
            var count = 0;
            angular.forEach(scope.plugin.requirements, function (req) {
              if (req.achieved) {
                count = count + 1;
              }
            });
            scope.plugin.totalAchieved = count;
            if (scope.plugin.totalAchieved === scope.plugin.requirements.length) {
              // HACK TODO we need to implement a real way for items to control the visibility of other items or scenes.
              // The silly workaround here only works (for some poorly-defined version of 'works') because USC episodes only have one badge
              modelSvc.episodes[appState.episodeId].styleCss = modelSvc.episodes[appState.episodeId].styleCss + " uscHackUserHasBadge";
            }
          };

          // on link:
          scope.checkBadgeEligibility();

          // slow poll after that, up to some reasonable time limit
          var pollLimit = 0;
          scope.badgePoll = $interval(function () {
            // console.log('poll', pollLimit);
            pollLimit++;
            if (scope.item.isCurrent || appState.viewMode === 'review') {
              scope.checkBadgeEligibility();
            }
            if (pollLimit > 60) {
              $interval.cancel(scope.badgePoll);
            }
          }, 10000);

          scope.$on('$destroy', function () {
            $interval.cancel(scope.badgePoll);
          });

          scope.badger = function () {
            scope.plugin.gettingBadge = true;
            $http({
              method: 'GET',
              url: config.apiDataBaseUrl + '/v1/send_credly_badge?badge_id=' + scope.plugin.credlyBadgeId + '&email=' + scope.plugin.userEmail
            })
              .success(function (data) {
                // TODO check the data to make sure it's not status: "Badge previously sent."
                scope.checkBadgeEligibility();
                // console.log("SUCCESS", data);
                if (data.status === 'Badge previously sent.') {
                  scope.plugin.alreadyHadBadge = true;
                }
                scope.plugin.gotBadge = true;
              })
              .error(function () {
                scope.plugin.gettingBadge = false;
                scope.plugin.error = true; // TEMP HACK
              });
          };
        }
        // END credly badge
      }
      // end plugin

    }
  };
}
