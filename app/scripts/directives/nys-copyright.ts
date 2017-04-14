/**
 * Created by githop on 10/7/16.
 */

export default function nysCopyright() {
  return {
    template: [
      'Narrative Player &#169;',
      '<span ng-bind-html="now | date:\'yyyy\'" ></span>',
      '<a href="//narrasys.com" target="_blank" rel="noopener noreferrer"> Narrasys</a>. All rights reserved.',
      '<br>',
      '<a href="/privacy">Privacy</a>',
      '<span ng-if="narrative.support_url"> - ',
      '	<a ng-href="{{narrative.support_url}}">Support</a>',
      '</span>'
    ].join('')
  };
}
