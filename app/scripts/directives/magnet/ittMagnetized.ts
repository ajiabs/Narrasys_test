// @npUpgrade-player-false

import { CHANGE_MAGNET, JUMP_TO_MAGNET } from '../../constants';

export class Magnetized implements ng.IDirective {
  restrict: string = 'A';
  static Name = 'ittMagnetized'; // tslint:disable-line
  static $inject = ['$rootScope', 'appState'];

  constructor(
    private $rootScope: ng.IRootScopeService,
    private appState) {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = ($rootScope, appState) => new Magnetized($rootScope, appState);
    directiveInstance.$inject = Magnetized.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, element: JQuery, attrs: ng.IAttributes): void {
    const WIDTH = 854;
    const TRANSITION_DURATION = '0.25s';

    const jumpToMagnet = (magnetElmBcr: ClientRect, animateTransition: boolean) => {

      if (magnetElmBcr == null) {
        return;
      }

      if (this.appState.viewMode === 'review') {
        element.css('position', 'fixed');
      } else {
        element.css('position', 'absolute');
      }

      const { top, left, width } = magnetElmBcr;

      if (animateTransition === true) {
        element.css('transition-timing-function', 'cubic-bezier(0.4, 0, 1, 1)');
        element.css('transition-duration', TRANSITION_DURATION);
      } else {
        element.css('transition-duration', 'unset');
        element.css('transition-timing-function', 'unset');
      }

      const scaleFactor = width / WIDTH;
      if (scaleFactor === 0) {
        return;
      }

      element.css('transform', `translate(${Math.abs(left)}px, ${Math.abs(top)}px) scale(${scaleFactor})`);
    };

    this.$rootScope.$on(CHANGE_MAGNET, (evt, magnetElmBcr: ClientRect) => jumpToMagnet(magnetElmBcr, true));
    this.$rootScope.$on(JUMP_TO_MAGNET, (evt, magnetElmBcr: ClientRect) => jumpToMagnet(magnetElmBcr, false));
  }
}
