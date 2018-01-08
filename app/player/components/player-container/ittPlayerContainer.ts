// @npUpgrade-player-false
/**
 * Created by githop on 7/5/17.
 */

import playerHtml from './player.html';

export function ittPlayerContainer() {
  return {
    template: playerHtml,
    controller: 'PlayerController'
  };
}
