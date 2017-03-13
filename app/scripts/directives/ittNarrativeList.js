(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittNarrativeList', ittNarrativeList);

  function ittNarrativeList() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'templates/narrativelist.html',
      scope: {
        customersData: '='
      },
      controller: ['$location', 'authSvc', 'appState', 'dataSvc', 'modelSvc', 'ittUtils',
        function ($location, authSvc, appState, dataSvc, modelSvc, ittUtils) {
          var ctrl = this;
          var _existy = ittUtils.existy;

          angular.extend(ctrl, {
            //properties
            narrativeSelect: false,
            //methods
            logout: authSvc.logout,
            user: appState.user,
            toggleSelectNarrative: toggleSelectNarrative,
            addNarrative: addNarrative,
            customerRowClick: customerRowClick,
            gotoNarrative: gotoNarrative,
            toggleRow: toggleRow
          });

          onInit();

          function onInit() {
            if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
              ctrl.canAccess = true;
            }

            var len = ctrl.customersData.length, i = 0;
            for (; i < len; i++) {
              var currentCust = ctrl.customersData[i];
              currentCust.evenOdd = i % 2 === 0;

              var hasNarrativesOpen = _existy(currentCust.showNarratives) &&
                                      currentCust.showNarratives === true &&
                                      currentCust.narratives.length % 2 === 1;

              if (hasNarrativesOpen) {
                _updateAllEvenOdd();
                break;
              }
            }
          }

          function toggleSelectNarrative(customer) {
            ctrl.narrativeSelect = !ctrl.narrativeSelect;
            ctrl.selectedCustomer = [customer];
          }

          function addNarrative(n) {
            dataSvc.createNarrative(n).then(function (narrative) {
              narrative.subDomain = modelSvc.customers[narrative.customer_id].domains[0];
              modelSvc.cache('narrative', narrative);
              $location.path('/story/' + narrative._id);
            });
          }

          function gotoNarrative(narrativeId, $ev) {
            $ev.stopPropagation();
            $location.path('/story/' + narrativeId);
          }

          function customerRowClick(customer, $ev) {
            $ev.stopPropagation();
            customer.isActive = !customer.isActive;

            ctrl.customersData.forEach(function(cust) {
              if (customer._id !== cust._id) {
                cust.isActive = false;
              }
            });
          }

          function toggleRow(customer, $ev, $index) {
            $ev.stopPropagation();
            // _closeOpenNarratives(customer);
            customer.showNarratives = !customer.showNarratives;
            if (customer.showNarratives) {
              _toggleNarrativesOpened(customer, $index);
            } else {
              customer.showNarratives = false;
              _toggleNarrativesClosed(customer, $index);
            }
          }

          function _toggleNarrativesClosed(customer, $index) {
            if (customer.narratives.length % 2 === 1) {
              _updateAllEvenOdd($index);
            }
          }

          function _toggleNarrativesOpened(customer, $index) {
            //lazily load customers and cache them for later
            if (!_existy(customer.narratives) || customer.narratives.length === 0) {
              //fetch and cache is async and will handle setting the evenOdd on the narratives/customers
              //after they have resolved.
              _fetchAndCacheNarratives(customer, $index);
            }
            //if we already cached our narratives and the list length is odd
            //need to update the customers evenOdd.
            if (_existy(customer.narratives) && customer.narratives.length % 2 === 1) {
              _updateAllEvenOdd($index);
            }

          }

          function _fetchAndCacheNarratives(customer, $index) {
            dataSvc.getNarrativeList(customer).then(function(customerResp) {
              //setting evenOdd after fetching should only need to happen the first time.
              _updateAllEvenOdd($index);
            });
          }

          function _updateAllEvenOdd() {
            var rest = 1;
            var len = ctrl.customersData.length;
            for (; rest < len; rest++) {

              var nextCust = ctrl.customersData[rest];
              var currentCust = ctrl.customersData[rest - 1];
              var lastNarr = null;

              if (_existy(currentCust.narratives) && currentCust.narratives.length > 0 && currentCust.showNarratives === true) {
                _updateNarrativeEvenOdd(currentCust, rest);
                lastNarr = currentCust.narratives[currentCust.narratives.length - 1];
              }

              if (_existy(lastNarr)) {
                nextCust.evenOdd = !lastNarr.evenOdd
              } else {
                nextCust.evenOdd = !currentCust.evenOdd;
              }

            }
          }

          //look at the evenOdd of the customer selected,
          //set the first narrative to the opposite of the above
          function _updateNarrativeEvenOdd(customer) {
            customer.narratives = customer.narratives.reduce(function(narrs, narr, index) {
              if (index === 0) {
                //set first narrative to be opposite of customer
                narr.evenOdd = !customer.evenOdd;
                narrs.push(narr);
                return narrs;
              }

              //continue alternating scheme by looking at the prior index and flipping it.
              narr.evenOdd = !narrs[index - 1].evenOdd;
              narrs.push(narr);
              return narrs;
            }, []);
          }
        }],
      controllerAs: '$ctrl',
      bindToController: true
    };
  }

})();

