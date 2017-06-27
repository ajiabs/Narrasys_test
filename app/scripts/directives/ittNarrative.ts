/*

 TODO:
 split this file up into separate directive files
 when displaying a narrative, compare its user_id to the current user's id to set isOwner
 i18n

 To create a narrative:
 * get the user ID, make a group containing that ID,
 * create narrative with name,description,group id

 TO add a timeline:
 * user chooses a parent episode

 * create timeline with name,description,hidden,path, sort_order
 * make a child episode of parent episode
 * make an episode segment (needs timeline id, start, end, child episode id, sort_order)

 * then reload narrative/resolve

 (resolve should sort timelines and segments, API won't necessarily handle this for us)

 to update narrative or timeline: just send the basic fields, not the fully-resolved data.


 */
import {INarrative} from '../models';
export default function ittNarrative() {
  return {
    templateUrl: 'templates/narrative/default.html',
    scope: {
      narrativeData: '=',
      customerData: '='
    },
    controller: ['$scope', 'authSvc', 'appState', 'dataSvc', 'modelSvc', 'ittUtils',
      function ($scope, authSvc, appState, dataSvc, modelSvc, ittUtils) {

        var treeOpts = {
          accept: function(/*sourceNodeScope, destNodesScope, destIndex*/) {
            return true;
          },
          dropped: function(event) {
            var destIndex = event.dest.index;
            var srcIndex = event.source.index;
            if (destIndex !== srcIndex) {
              _updateSortOrder(destIndex, $scope.narrative.timelines);
              _persistTimelineSortUpdate($scope.narrative.timelines[destIndex]);
            }

          }
        };

        angular.extend($scope, {
          toggleEditNarrativeModal: toggleEditNarrativeModal,
          toggleEditingTimeline: toggleEditingTimeline,
          doneEditingTimeline: doneEditingTimeline,
          toggleOwnership: toggleOwnership,
          toggleEpisodeList: toggleEpisodeList,
          updateNarrative: updateNarrative,
          updateTimeline: updateTimeline,
          addTmpTimeline: addTmpTimeline,
          onEpisodeSelect: onEpisodeSelect,
          persistTmpTimeline: persistTmpTimeline,
          editorAction: editorAction,
          deleteTimeline: deleteTimeline,
          exportToSpreadsheet: dataSvc.getNarrativeExportAsSpreadsheet,
          canAccess: false,
          treeOpts: treeOpts
        });

        onInit();

        function _updateSortOrder(destIndex, arr) {
          var len = arr.length;
          var sortIndex = 0;
          if (destIndex > 0) {

            if (destIndex === len - 1) {
              sortIndex = arr[destIndex - 1].sort_order + 100;
            } else {
              sortIndex = ittUtils.bitwiseCeil((arr[destIndex - 1].sort_order + arr[destIndex + 1].sort_order ) / 2);
            }

          }
          var prevSortIndex = sortIndex;
          arr[destIndex].sort_order = sortIndex;
          destIndex++;
          sortIndex++;
          for (; destIndex < len; destIndex++) {
            if (prevSortIndex >= arr[destIndex].sort_order) {
              arr[destIndex].sort_order = sortIndex;
            }
            prevSortIndex = sortIndex;
            sortIndex++;
          }
        }

        function _persistTimelineSortUpdate(timeline) {
          dataSvc.storeTimeline($scope.narrative._id, timeline).then(function(resp) {
            angular.extend(timeline, resp);
          });
        }

        //set up scope and bindings
        function onInit() {
          $scope.loading = true;
          $scope.logout = authSvc.logout;
          $scope.isOwner = false;
          $scope.narrative = $scope.narrativeData;
          $scope.customers = $scope.customerData;
          $scope.user = appState.user;
          if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
            $scope.canAccess = true;
          }
          $scope.loading = false;
          _setTotalNarrativeDuration($scope.narrative.timelines);
        }

        function toggleEditNarrativeModal() {

          var cachedNarratives = ittUtils.existy($scope.customers[0]) &&
            ittUtils.existy($scope.customers[0].narratives) &&
            $scope.customers[0].narratives.length > 1;
          //need list of other narratives to for validation of path slugs.
          if (!cachedNarratives) {
            dataSvc.getNarrativeList($scope.customers[0])
              .then(function() {
                $scope.editingNarrative = !$scope.editingNarrative;
              });
          } else {
            $scope.editingNarrative = !$scope.editingNarrative;
          }
        }

        function toggleEditingTimeline(tl) {
          $scope.timelineUnderEdit = tl;
        }

        function toggleOwnership() {
          $scope.isOwner = !$scope.isOwner;
        }

        function toggleEpisodeList() {
          $scope.showEpisodeList = !$scope.showEpisodeList;
        }

        function doneEditingTimeline() {
          $scope.timelineUnderEdit = null;
          //remove tmp tl from timelines;
          $scope.narrative.timelines = $scope.narrative.timelines.filter(function(tl) {
            return tl !== $scope.tmpTimeline;
          });
          $scope.tmpTimeline = null;
        }

        function editorAction(newTl, currTl) {
          if (newTl.isTemp === true) {
            persistTmpTimeline(newTl);
          } else {
            updateTimeline(newTl, currTl);
          }
        }

        function _setTotalNarrativeDuration(timelines) {
          $scope.totalNarrativeDuration = timelines.map(function (tl) {
            return tl.episode_segments.map(function(s) {return s.end_time;})[0];
          }).reduce(function(accm, durs) {
            return accm += durs;
          }, 0);
        }

        function deleteTimeline(tl) {
          dataSvc.deleteTimeline(tl._id).then(function() {
            $scope.narrative.timelines = $scope.narrative.timelines.filter(function(t) {
              return tl._id !== t._id;
            });
            doneEditingTimeline();
            _setTotalNarrativeDuration($scope.narrative.timelines);
          });
        }

        //this function kicks off the following sequence: addTmpTimeline -> onEpisodeSelect -> persistTmpTimeline
        //addTempTimeline creates a temporary object and puts it on the narrative.timelines scope (so we can use it
        //in the view via ittTimelineEditor directive)
        //onEpisodeSelect fills some of the temp props with actual props back from the selected episode
        //persistTempTimeline saves the freshly created timeline
        function addTmpTimeline(currTl, timelines) {
          var currSortOrder;
          var fromTl;
          var nextTlSortOrder;
          var currIndex;
          var newIndex;

          if (!ittUtils.existy(currTl)) {
            currSortOrder = 0;
            newIndex = 0;
          } else {
            currIndex = timelines.indexOf(currTl);
            newIndex = currIndex + 1;
            fromTl = timelines[currIndex];
            currSortOrder = fromTl.sort_order;
            if (timelines.slice(-1)[0] === fromTl) {
              currSortOrder += 100;
            } else {
              nextTlSortOrder = timelines[currIndex + 1].sort_order;
              currSortOrder = ittUtils.bitwiseCeil((nextTlSortOrder + currSortOrder) / 2);
            }

          }
          var newTimeline = {
            name: {en: ''},
            description: {en: ''},
            hidden: false,
            sort_order: currSortOrder,
            isTemp: true,
            index: newIndex
          };
          //favor slice over splice as splice mutates array in place.
          var head = timelines.slice(0, newIndex);
          var tail = timelines.slice(newIndex, timelines.length);
          head.push(newTimeline);
          timelines = head.concat(tail);
          $scope.narrative.timelines = timelines;
          $scope.tmpTimeline = newTimeline;
          //to open episode select modal
          toggleEpisodeList();
        }

        function onEpisodeSelect(epId) {
          //if tmpTimeline is not set, assume
          // this is the first timeline to create;
          dataSvc.getEpisodeOverview(epId).then(function(episodeData) {
            $scope.tmpTimeline.parent_episode = episodeData;

            if (ittUtils.existy(episodeData.description)) {
              $scope.tmpTimeline.description.en = ittUtils.stripHtmlTags(episodeData.description.en);
            }

            $scope.tmpTimeline.name.en = ittUtils.stripHtmlTags(episodeData.title.en);
            return episodeData;
          }).then(function(episodeData) {
            dataSvc.getSingleAsset(episodeData.master_asset_id).then(function(data) {
              if (data) {
                $scope.tmpTimeline.duration = data.duration;
              } else {
                $scope.tmpTimeline.duration = 0;
              }
              //to close episode select modal after select
              toggleEpisodeList();
              //to open the timeline editor modal
              persistTmpTimeline($scope.tmpTimeline);
            });
          });
        }

        function persistTmpTimeline(tl) {
          _updateSortOrder(tl.index, $scope.narrative.timelines);
          dataSvc.createChildEpisode({
            parent_id: tl.parent_episode._id,
          })
            .then(storeChildEpisode)
            .then(handleEpisodeSegment)
            .catch(logErr);

          function storeChildEpisode(childEpisode) {
            return dataSvc.storeTimeline($scope.narrative._id, tl).then(function(tlData) {
              return {d: tlData, e: childEpisode};
            });
          }

          function handleEpisodeSegment(config) {
            var tlData = config.d;
            var childEpisode = config.e;
            dataSvc.createEpisodeSegment(tlData._id, {
              episode_id: childEpisode._id,
              start_time: 0,
              end_time: tl.duration,
              sort_order: 0,
              timeline_id: tlData._id
            }).then(function(segmentData) {
              tlData.episode_segments = [segmentData];
              angular.forEach($scope.narrative.timelines, function(tl) {
                if (tl.sort_order === tlData.sort_order) {
                  angular.extend(tl, tlData);
                }
              });
              $scope.tmpTimeline = null;
              doneEditingTimeline();
              _setTotalNarrativeDuration($scope.narrative.timelines);
            });
          }

          function logErr(e) { console.log(e); }
        }

        function updateNarrative(update) {
          dataSvc.updateNarrative(update).then(function (resp: {data: INarrative}) {
            $scope.editingNarrative = false;
            //updateNarrative returns just the new narrative object, without timelines array
            //merge the existing narrative on scope with the one returned via our post resp.
            angular.extend($scope.narrative, resp.data);
            var cust = modelSvc.customers[resp.data.customer_id];
            modelSvc.assocNarrativesWithCustomer(cust, [resp.data]);
          });
        }

        function updateTimeline(newTimeline, oldTimeline) {
          dataSvc.storeTimeline($scope.narrative._id, newTimeline).then(function(resp) {
            angular.extend(oldTimeline, resp);
            doneEditingTimeline();
          });
        }
      }]
  };
}



