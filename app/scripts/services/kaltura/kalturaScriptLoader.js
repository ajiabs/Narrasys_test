/**
 * Created by githop on 1/13/17.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaScriptLoader', kalturaScriptLoader);

	function kalturaScriptLoader($q, $timeout) {
		return {
			load: load
		};

		function load(partnerId, uiConfId) {
			return $q(function(resolve){
				var src = 'https://cdnapisec.kaltura.com/p/' + partnerId + '/sp/' + partnerId + '00/embedIframeJs/uiconf_id/' + uiConfId + '/partner_id/' + partnerId;
				var tag = document.createElement('script');
				tag.src = src;
				tag.id = partnerId;
				var firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				$timeout(resolve, 500);
			});
		}
	}


})();
