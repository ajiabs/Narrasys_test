'use strict';

//TODO rename this ProducerController

angular.module('com.inthetelling.player')
	.controller('EpisodeEditorController', function($scope, $injector, modelSvc) {
		console.log('EpisodeEditorController');

		// this is basically playerController...
		$injector.invoke(PlayerController, this, {
			$scope: $scope
		});

		// ...except:
		modelSvc.appState.producer = true;
		modelSvc.appState.HELLODOLLY = "fantastic";

	});
