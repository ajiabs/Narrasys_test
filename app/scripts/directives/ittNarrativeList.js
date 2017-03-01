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
            fetchNarratives: fetchNarratives,
            gotoNarrative: gotoNarrative
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

          function fetchNarratives(customer, $ev, $index) {
            $ev.stopPropagation();

            if (!_existy(customer.narratives) || customer.narratives.length === 0) {
              dataSvc.getNarrativeList(customer).then(function(customer) {
                _toggleNarrativesDisplay(customer, $index);
              });
            } else {
              _toggleNarrativesDisplay(customer, $index);
            }


            function _toggleNarrativesDisplay(customer, $index) {

              customer.showNarratives = !customer.showNarratives;

              var currentEvenOdd = ctrl.customersData[$index].evenOdd;

              customer.narratives = customer.narratives.reduce(function(narrs, narr, index) {
                if (index === 0) {
                  narr.evenOdd = !currentEvenOdd;
                  narrs.push(narr);
                  return narrs;
                }

                  narr.evenOdd = !narrs[index - 1].evenOdd;
                  narrs.push(narr);
                  return narrs;
              }, []);



              // var lastNarEvenOdd = customer.narratives[customer.narratives.length - 1].evenOdd;
              // custRest.forEach(function(customer, index) {
              //   if (index === 0) {
              //     customer.evenOdd = !lastNarEvenOdd;
              //   } else {
              //     customer.evenOdd = !custRest[index - 1].evenOdd
              //   }
              // });
              //
              // ctrl.customersData = [custHead].concat(custRest);


              // customer.narratives = customer.narratives.reduce(function(narrs, narr, index) {
              //
              //   if (index === 0) {
              //     narr.evenOdd = lastCustEvenOdd;
              //     narrs.push(narr);
              //     return narrs;
              //   }
              //
              //   narr.evenOdd = !narrs[index - 1].evenOdd;
              //   narrs.push(narr);
              //   return narrs;
              // }, []);
              //
              // var lastNarrEvenOdd = customer.narratives.length % 2 === 0;
              // var rest = $index + 1;
              //
              // for (; rest < ctrl.customersData.length; rest++) {
              //   ctrl.customersData[rest].showNarratives = false;
              //
              //   if (rest - 1 === $index) {
              //     ctrl.customersData[rest].evenOdd = !lastNarrEvenOdd;
              //     // rest++;
              //     break;
              //   }
              //
              //   ctrl.customersData[rest].evenOdd = !ctrl.customersData[rest - 1].evenOdd;
              // }

              // ctrl.customersData.forEach(function(cust) {
              //   if (customer._id !== cust._id) {
              //     cust.showNarratives = false;
              //     cust.evenOdd = !cust.evenOdd;
              //   }
              // });
            }
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

