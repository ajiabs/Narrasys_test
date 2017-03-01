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

            ctrl.customersData.forEach(function(cust, index) {
              cust.evenOdd = index % 2 === 0;
              if (_existy(cust.narratives) && cust.narratives.length >= 1) {
                cust.narratives.forEach(function(narr, index) {
                  narr.evenOdd = index % 2 === 0;
                });
              }
            });
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

          function customerRowClick(customer) {
            customer.isActive = !customer.isActive;

            ctrl.customersData.forEach(function(cust) {
              if (customer._id !== cust._id) {
                cust.isActive = false;
              }
            });
          }

          function toggleRow(customer, $ev, $index) {
            $ev.stopPropagation();
            customer.showNarratives = !customer.showNarratives;

            if (customer.showNarratives) {
              _toggleNarrativesOpened(customer, $index);
            } else {
              _toggleNarrativesClosed(customer, $index);
            }
          }

          function _toggleNarrativesClosed(customer, $index) {
            if (customer.narratives.length % 2 === 1) {
              _updateCustomersEvenOdd($index, $index % 2 === 1);
            }
          }

          function _toggleNarrativesOpened(customer, $index) {
            if (!_existy(customer.narratives) || customer.narratives.length === 0) {
              _fetchAndCacheNarratives(customer, $index);
            }

            if (_existy(customer.narratives) && customer.narratives.length % 2 === 1) {
              _updateCustomersEvenOdd($index, $index % 2 === 0);
            }

          }

          function _fetchAndCacheNarratives(customer, $index) {
            dataSvc.getNarrativeList(customer).then(function(customerResp) {
              _updateNarrativeEvenOdd(customerResp, $index);
              if (customer.narratives.length % 2 === 1) {
                _updateCustomersEvenOdd($index, $index % 2 === 0);
              }
            });
          }

          function _updateCustomersEvenOdd($index, bool) {
            var rest = $index + 1;
            for (; rest < ctrl.customersData.length; rest++) {
              if (rest === $index + 1) {
                ctrl.customersData[rest].evenOdd = bool;
                continue;
              }
              ctrl.customersData[rest].evenOdd = !ctrl.customersData[rest - 1].evenOdd;
            }
          }

          function _updateNarrativeEvenOdd(customer, $index) {
            var currentEvenOdd = ctrl.customersData[$index].evenOdd;
            customer.narratives = customer.narratives.reduce(function(narrs, narr, index) {
              if (index === 0) {
                //set first narrative to be opposed of customer
                narr.evenOdd = !currentEvenOdd;
                narrs.push(narr);
                return narrs;
              }

              //continue alternating scheme by looking at the prior index and flipping it.
              narr.evenOdd = !narrs[index - 1].evenOdd;
              narrs.push(narr);
              return narrs;
            }, []);
          }

          function gotoNarrative(narrativeId, $ev) {
            $ev.stopPropagation();
            window.location.href = '/#/story/' + narrativeId;
          }

        }],
      controllerAs: '$ctrl',
      bindToController: true
    };
  }

})();

