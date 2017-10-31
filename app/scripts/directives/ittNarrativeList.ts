export default function ittNarrativeList() {
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
          narrativeRow: null,
          //methods
          logout: authSvc.logout.bind(authSvc),
          user: appState.user,
          setSelectedNarrative: setSelectedNarrative,
          customerRowClick: customerRowClick,
          gotoNarrative: gotoNarrative,
          toggleRow: toggleRow,
          setRowClasses: setRowClasses,
          setNarrativeRowClasses: setNarrativeRowClasses,
          setNarrativeToEdit: setNarrativeToEdit,
          closeAddOrEditModal: closeAddOrEditModal,
          addOrUpdateNarrative: addOrUpdateNarrative,
          toggleNarrativeRow: toggleNarrativeRow
        });

        onInit();

        function onInit() {
          if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
            ctrl.canAccess = true;
          }

          _updateAllEvenOdd();
        }

        function toggleNarrativeRow(narrative, $ev) {
          $ev.stopPropagation();

          if (ctrl.narrativeRow === null) {
            ctrl.narrativeRow = narrative;
          } else if (narrative === ctrl.narrativeRow) {
            ctrl.narrativeRow = null;
          } else {
            ctrl.narrativeRow = narrative;
          }

          //close any selected customers
          ctrl.customersData.forEach(function (cust) {
            cust.isActive = false;
          });

        }

        function closeAddOrEditModal(narrative) {
          ctrl.narrativeSelect = false;
          ctrl.selectedCustomer = [];
          ctrl.narrativeToEdit = false;
          if (narrative) {
            $location.path('/story/' + narrative._id);
          }
        }

        function handleErr(err) {
          if (err.data.path_slug) {
            ctrl.narrativeToEdit.error = 'path slug is already taken';
          }
        }

        function addOrUpdateNarrative(n) {
          var method = '';
          if (ctrl.narrativeSelect === true) {
            method = 'createNarrative';
          } else if (Object.prototype.toString.call(n) === '[object Object]') {
            method = 'updateNarrative';
          }

          _addOrUpdateNarr(n, method)
            .then(closeAddOrEditModal)
            .catch(function (err) {
              handleErr(err);
            });

        }

        function setSelectedNarrative(customer) {

          var cachedNarratives = ittUtils.existy(customer.narratives) && customer.narratives.length > 1;

          ctrl.selectedCustomer = [customer];
          //need list of other narratives to for validation of path slugs.

          if (!cachedNarratives) {
            dataSvc.getNarrativeList(customer)
              .then(function () {
                ctrl.narrativeSelect = !ctrl.narrativeSelect;
              });
          } else {
            ctrl.narrativeSelect = !ctrl.narrativeSelect;
          }
        }

        function setNarrativeToEdit($ev, narrative, customer) {
          $ev.stopPropagation();
          ctrl.narrativeToEdit = narrative;
          ctrl.selectedCustomer = [customer];
        }

        function setRowClasses(customer) {
          return {
            'hoverIndicator': !customer.showNarratives,
            'container__row--even': customer.evenOdd === false,
            'container__row--odd': customer.evenOdd === true,
            'isActive': customer.isActive
          };
        }

        function setNarrativeRowClasses(customer, narrative) {
          return {
            'hoverIndicator': customer.showNarratives,
            'container__row--even': narrative.evenOdd === false,
            'container__row--odd': narrative.evenOdd === true,
            'isActive': narrative === ctrl.narrativeRow
          };
        }

        function gotoNarrative(narrativeId, $ev) {
          $ev.stopPropagation();
          $location.path('/story/' + narrativeId);
        }

        function customerRowClick(customer, $ev) {
          $ev.stopPropagation();
          customer.isActive = !customer.isActive;
          ctrl.narrativeRow = null;
          ctrl.customersData.forEach(function (cust) {
            if (customer._id !== cust._id) {
              cust.isActive = false;
            }
          });
        }

        function toggleRow(customer, $ev) {
          $ev.stopPropagation();
          customer.showNarratives = !customer.showNarratives;
          if (customer.showNarratives) {
            _toggleNarrativesOpened(customer);
          } else {
            customer.showNarratives = false;
            _toggleNarrativesClosed();
          }
        }

        function _addOrUpdateNarr(n, method) {
          return dataSvc[method](n)
            .then(function (resp) {
              var narrative = resp.data;
              var customer = modelSvc.customers[narrative.customer_id];
              customer = modelSvc.assocNarrativesWithCustomer(customer, [narrative]);
              var custOnScope = ctrl.customersData.filter(function (cust) {
                return cust._id === customer._id;
              });
              if (custOnScope.length === 1) {
                _updateNarrativeEvenOdd(customer);
                custOnScope[0] = customer;
                if (method === 'createNarrative') {
                  return narrative;
                }
              }
            });
        }

        function _toggleNarrativesClosed() {
          _updateAllEvenOdd();
        }

        function _toggleNarrativesOpened(customer) {
          //lazily load customers and cache them for later
          if (!_existy(customer.narratives) || customer.narratives.length === 0) {
            //fetch and cache is async and will handle setting the evenOdd on the narratives/customers
            //after they have resolved.
            _fetchAndCacheNarratives(customer);
          }
          //if we already cached our narratives and the list length is odd
          //need to update the customers evenOdd.
          if (_existy(customer.narratives) && customer.narratives.length >= 1) {
            _updateAllEvenOdd();
          }

        }

        function _fetchAndCacheNarratives(customer) {
          dataSvc.getNarrativeList(customer).then(function () {
            //setting evenOdd after fetching should only need to happen the first time.
            _updateAllEvenOdd();
          });
        }

        function _updateAllEvenOdd() {
          var rest = 1;
          var len = ctrl.customersData.length;
          for (; rest <= len; rest++) {
            if (rest - 1 === 0) {
              ctrl.customersData[0].evenOdd = false;
            }
            var nextCust = ctrl.customersData[rest];
            var currentCust = ctrl.customersData[rest - 1];
            var lastNarr = null;

            if (_existy(currentCust.narratives) && currentCust.narratives.length > 0 && currentCust.showNarratives === true) {
              _updateNarrativeEvenOdd(currentCust);
              lastNarr = currentCust.narratives[currentCust.narratives.length - 1];
            }

            if (!_existy(nextCust)) {
              return;
            }

            if (_existy(lastNarr)) {
              nextCust.evenOdd = !lastNarr.evenOdd;
            } else {
              nextCust.evenOdd = !currentCust.evenOdd;
            }

          }
        }

        //look at the evenOdd of the customer selected,
        //set the first narrative to the opposite of the above
        function _updateNarrativeEvenOdd(customer) {
          customer.narratives = customer.narratives
            .sort(function (a, b) {
              var aName = a.name.en.toLowerCase();
              var bName = b.name.en.toLowerCase();
              if (aName < bName) {
                return -1;
              } else if (aName > bName) {
                return 1;
              }
              return 0;
            })
            .reduce(function (narrs, narr, index) {
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

