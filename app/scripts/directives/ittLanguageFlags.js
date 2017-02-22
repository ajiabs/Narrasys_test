/**
 * Created by githop on 8/23/16.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittLanguageFlags', ittLanguageFlags);
  //impure, currently depends on inheriting scope for 'langform'
  function ittLanguageFlags() {
    return {
      restrict: 'EA',
      template: [
        '<div class="field">',
        ' <div class="label">Languages</div>',
        ' <div class="input">',
        '   <itt-validation-tip ng-if="doNotice" text="{{notice}}"></itt-validation-tip>',
        '   <span ng-repeat="(key, val) in langForm">',
        '	    <label>',
        '		    <input type="checkbox" name="{{key}}" ng-model="langForm[key]" ng-required="!requireLang(langForm)">{{key | langDisplay}}',
        '	    </label>',
        '   </span>',
        ' </div>',
        '</div>'
      ].join('\n'),
      controller: ['$scope', function($scope) {
        $scope.$watch(watchForm, handleUpdates, true);

        function watchForm() {
          return $scope.langForm
        }

        function handleUpdates(newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.doNotice = !requireLang(newVal);
            if ($scope.doNotice === true) {
              $scope.notice = 'At least 1 language required';
            }
          }
        }

        $scope.requireLang = requireLang;
        function requireLang(langForm) {
          return Object.keys(langForm)
            .some(function(code) {
              return langForm[code];
            });
        }

      }]
    };
  }


})();
