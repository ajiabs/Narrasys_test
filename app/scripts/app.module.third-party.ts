/**
 * Created by githop on 6/28/16.
 */

import 'angular';
import 'textAngular/dist/textAngular-sanitize.min';
import 'textAngular';
import 'angular-ui-tree';

let thirdParty = angular.module('iTT.3rdPartyLibs', ['textAngular', 'ui.tree'])
.config(($provide) => {
	'ngInject';

	$provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
		taOptions.forceTextAngularSanitize = false;

		taOptions.toolbar = [
			['h1', 'h2', 'h3'],
			['bold', 'italics', 'underline', 'strikeThrough'],
			['ul', 'ol'],
			['undo', 'redo', 'clear']
			// ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
			// ['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
			// ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
		];
		return taOptions;
	}]);
});

export default thirdParty;
