// @npUpgrade-player-false
/*

 No sneaky changing the tab order or number of tabs after init allowed.

 Possibly boneheaded parts of this:

 - jQuery (.find())
 - depends on magic classNames 'cur' and 'ittTab'
 - depends on the directive user to keep track of tabindex :P

 TODO: allow different html layouts in ittTab (right now this is just for the producer edit pane)

 *** this is now deprecated **
 How to use:

 <div class="ittTabs" itt-tabs>
 <div class="ittTab" itt-tab="tabs[0]" x-tabindex="0" x-tablabel="Label 1">
 Tab contents 1
 </div>
 <div class="ittTab cur" itt-tab="tabs[1]" x-tabindex="1" x-tablabel="Label 2">
 Tab contents 2 (Note that you can force this to start as the visible tab by giving it class 'cur')
 </div>
 <div class="ittTab" itt-tab="tabs[2]" x-tabindex="2" x-tablabel="Label 3">
 Tab contents 3
 </div>
 </div>

 *** new Example **
 improvements:
 - directive user does not need to keep track of tab index.
 - no jQuery dep.
 - still uses cur css class to style selected tab label.
 <itt-tabs>
 <itt-tab title="title 1"> contents </itt-tab>
 <itt-tab title="title 2"> contents </itt-tab>
 <itt-tab title="title 3"> contents </itt-tab>
 </itt-tabs>

 */
export default function ittTabs() {
  return {
    template: [
      '<div class="">',
      '	<ul class="nav nav-tabs">',
      '		<li ng-repeat="pane in panes" class="tab-pane"><p class="ittTabLabel" ng-class="{cur:pane.selected}" ng-click="select(pane)">{{pane.title}}</p></li>',
      '	</ul>',
      '	<div class="tab-content"><ng-transclude></ng-transclude></div>',
      '</div>'
    ].join(''),
    transclude: true,
    restrict: 'EA',
    scope: {},
    controller: ['$scope', function ($scope) {
      var panes = $scope.panes = [];
      $scope.select = select;
      var ctrl = this;

      function select(pane) {
        angular.forEach(panes, function (p) {
          p.selected = false;
        });
        pane.selected = true;
      }

      ctrl.addPane = function addPane(pane) {
        if (panes.length === 0) {
          select(pane);
        }
        panes.push(pane);
      };

    }]
  };
}

