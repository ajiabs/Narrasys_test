'use strict';

angular.module('com.inthetelling.player')
	.factory('modalMgr', function(videojs, $modal, _) {

	// hold on to a reference of the init overlay so the consumer can
	// create/destroy it asynchronously without needing to keep its own reference
	var initOverlay;
	
	var svc = {};
	
	// Method to show the overlay for item detail view
	// itemScope: the scope of the ittItem directive we are creating this overlay for
	svc.createItemDetailOverlay = function(itemScope) {
		console.log("createItemDetailOverlay:", itemScope.item);
		
		itemScope.videoWasPlaying = !(videojs.player.paused()); // So we know whether to start it again when the modal is closed
		
		videojs.player.pause();
		
		var modal = $modal.open({
			keyboard: true,
			backdrop: true,
			templateUrl: itemScope.item.itemDetailTemplateUrl,
			windowClass: 'itemDetailModal',
			scope: itemScope,
			controller: function ($scope, $modalInstance) {
				$scope.close = function() {
					$modalInstance.close();
				};
			}
		});
		modal.result.then(function(){
			// if the modal closes 'successfully'
			if (itemScope.videoWasPlaying) {
				videojs.player.play();
			}
		}, function() {
			// if the modal is 'dismissed'
			if (itemScope.videoWasPlaying) {
				videojs.player.play();
			}
		});
	};


	// Method to show the global initialization overlay
	// Does not require a scope or a model
	svc.createInitOverlay = function() {
		console.log("createInitOverlay");
		if (!initOverlay) {
			initOverlay = $modal.open({
				keyboard: false,
				backdrop: 'static',
				templateUrl: 'templates/overlays/init.html'
			});
		}
	};

	// Method to hide the initialization overlay
	svc.destroyInitOverlay = function() {
		console.log("destroyInitOverlay");
		if (initOverlay) {
			initOverlay.close();
			initOverlay = null;
		}
	};

	return svc;

})

/* 
Below is the part of bootstrap.ui that we were actually using. 

TODO: combine modalBackdrop and modalWindow into one directive+template (we'll always have backdrop); move close() function from backdrop directive  to modal
TODO: rip out everything to do with managing multiple modals simultaneously (instead throw an error if try to open two at once)
TODO: was I overhasty in replacing templateUrl with a built-in template below?
TODO: (possibly) For items, inject modal into scene node instead of document root, so it can pick up the correct css path? (not sure about this, need to test...)
*/

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
	.factory('$$stackedMap', function () {
		return {
			createNew: function () {
				var stack = [];
				return {
					add: function (key, value) {
						stack.push({
							key: key,
							value: value
						});
					},
					get: function (key) {
						for (var i = 0; i < stack.length; i++) {
							if (key === stack[i].key) {
								return stack[i];
							}
						}
					},
					keys: function() {
						var keys = [];
						for (var i = 0; i < stack.length; i++) {
							keys.push(stack[i].key);
						}
						return keys;
					},
					top: function () {
						return stack[stack.length - 1];
					},
					remove: function (key) {
						var idx = -1;
						for (var i = 0; i < stack.length; i++) {
							if (key === stack[i].key) {
								idx = i;
								break;
							}
						}
						return stack.splice(idx, 1)[0];
					},
					removeTop: function () {
						return stack.splice(stack.length - 1, 1)[0];
					},
					length: function () {
						return stack.length;
					}
				};
			}
		};
	})

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
	.directive('modalBackdrop', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="modal-backdrop" x-ng-click="close($event)"></div>',
			link: function (scope, element, attrs) {
				//trigger CSS transitions
				$timeout(function () {
					scope.animate = true;
				});
				scope.close = function (evt) {
					var modal = $modalStack.getTop();
					if (modal && modal.value.backdrop && modal.value.backdrop !== 'static') {
						evt.preventDefault();
						evt.stopPropagation();
						$modalStack.dismiss(modal.key, 'backdrop click');
					}
				};
			}
		};
	}])

	.directive('modalWindow', ['$timeout', function ($timeout) {
		return {
			restrict: 'EA',
			scope: {
				index: '@'
			},
			replace: true,
			transclude: true,
			template: '<div class="modal {{windowClass}}" x-ng-transclude></div>',
			link: function (scope, element, attrs) {
				scope.windowClass = attrs.windowClass || '';
				//trigger CSS transitions
				$timeout(function () {
					scope.animate = true;
				});
			}
		};
	}])

	.factory('$modalStack', ['$document', '$compile', '$rootScope', '$$stackedMap',
		function ($document, $compile, $rootScope, $$stackedMap) {
			var backdropjqLiteEl, backdropDomEl;
			var backdropScope = $rootScope.$new(true);
			var body = $document.find('body').eq(0);
			var openedWindows = $$stackedMap.createNew();
			var $modalStack = {};
			function backdropIndex() {
				var topBackdropIndex = -1;
				var opened = openedWindows.keys();
				for (var i = 0; i < opened.length; i++) {
					if (openedWindows.get(opened[i]).value.backdrop) {
						topBackdropIndex = i;
					}
				}
				return topBackdropIndex;
			}
			$rootScope.$watch(backdropIndex, function(newBackdropIndex){
				backdropScope.index = newBackdropIndex;
			});
			function removeModalWindow(modalInstance) {
				var modalWindow = openedWindows.get(modalInstance).value;
				//clean up the stack
				openedWindows.remove(modalInstance);
				//remove window DOM element
				modalWindow.modalDomEl.remove();
				//remove backdrop if no longer needed
				if (backdropIndex() === -1) {
					backdropDomEl.remove();
					backdropDomEl = undefined;
				}
				//destroy scope
				modalWindow.modalScope.$destroy();
			}
			$document.bind('keydown', function (evt) {
				var modal;
				if (evt.which === 27) {
					modal = openedWindows.top();
					if (modal && modal.value.keyboard) {
						$rootScope.$apply(function () {
							$modalStack.dismiss(modal.key);
						});
					}
				}
			});
			$modalStack.open = function (modalInstance, modal) {
				openedWindows.add(modalInstance, {
					deferred: modal.deferred,
					modalScope: modal.scope,
					backdrop: modal.backdrop,
					keyboard: modal.keyboard
				});
				var angularDomEl = angular.element('<div modal-window></div>');
				angularDomEl.attr('window-class', modal.windowClass);
				angularDomEl.attr('index', openedWindows.length() - 1);
				angularDomEl.html(modal.content);
				var modalDomEl = $compile(angularDomEl)(modal.scope);
				openedWindows.top().value.modalDomEl = modalDomEl;
				body.append(modalDomEl);
				if (backdropIndex() >= 0 && !backdropDomEl) {
						backdropjqLiteEl = angular.element('<div modal-backdrop></div>');
						backdropDomEl = $compile(backdropjqLiteEl)(backdropScope);
						body.append(backdropDomEl);
				}
			};
			$modalStack.close = function (modalInstance, result) {
				var modal = openedWindows.get(modalInstance);
				if (modal) {
					modal.value.deferred.resolve(result);
					removeModalWindow(modalInstance);
				}
			};
			$modalStack.dismiss = function (modalInstance, reason) {
				var modalWindow = openedWindows.get(modalInstance).value;
				if (modalWindow) {
					modalWindow.deferred.reject(reason);
					removeModalWindow(modalInstance);
				}
			};
			$modalStack.getTop = function () {
				return openedWindows.top();
			};
			return $modalStack;
		}])

	.provider('$modal', function () {
		var $modalProvider = {
			options: {
				backdrop: true, //can be also false or 'static'
				keyboard: true
			},
			$get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
				function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
					var $modal = {};
					function getTemplatePromise(options) {
						return options.template ? $q.when(options.template) :
							$http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
								return result.data;
							});
					}
					function getResolvePromises(resolves) {
						var promisesArr = [];
						angular.forEach(resolves, function (value, key) {
							if (angular.isFunction(value) || angular.isArray(value)) {
								promisesArr.push($q.when($injector.invoke(value)));
							}
						});
						return promisesArr;
					}
					$modal.open = function (modalOptions) {
						var modalResultDeferred = $q.defer();
						var modalOpenedDeferred = $q.defer();
						//prepare an instance of a modal to be injected into controllers and returned to a caller
						var modalInstance = {
							result: modalResultDeferred.promise,
							opened: modalOpenedDeferred.promise,
							close: function (result) {
								$modalStack.close(modalInstance, result);
							},
							dismiss: function (reason) {
								$modalStack.dismiss(modalInstance, reason);
							}
						};
						//merge and clean up options
						modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
						modalOptions.resolve = modalOptions.resolve || {};
						//verify options
						if (!modalOptions.template && !modalOptions.templateUrl) {
							throw new Error('One of template or templateUrl options is required.');
						}
						var templateAndResolvePromise =
							$q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));
						templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
							var modalScope = (modalOptions.scope || $rootScope).$new();
							modalScope.$close = modalInstance.close;
							modalScope.$dismiss = modalInstance.dismiss;
							var ctrlInstance, ctrlLocals = {};
							var resolveIter = 1;
							//controllers
							if (modalOptions.controller) {
								ctrlLocals.$scope = modalScope;
								ctrlLocals.$modalInstance = modalInstance;
								angular.forEach(modalOptions.resolve, function (value, key) {
									ctrlLocals[key] = tplAndVars[resolveIter++];
								});
								ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
							}
							$modalStack.open(modalInstance, {
								scope: modalScope,
								deferred: modalResultDeferred,
								content: tplAndVars[0],
								backdrop: modalOptions.backdrop,
								keyboard: modalOptions.keyboard,
								windowClass: modalOptions.windowClass
							});
						}, function resolveError(reason) {
							modalResultDeferred.reject(reason);
						});
						templateAndResolvePromise.then(function () {
							modalOpenedDeferred.resolve(true);
						}, function () {
							modalOpenedDeferred.reject(false);
						});
						return modalInstance;
					};
					return $modal;
				}]
		};
		return $modalProvider;
	});
