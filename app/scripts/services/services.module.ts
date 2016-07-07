/**
 * Created by githop on 12/12/15.
 */
import 'angular';
import analyticsSvc from './analyticsSvc';
import appState from './appState';
import authSvc from './authSvc';
import awsSvc from './awsSvc';
import config from './config';
import dataSvc from './dataSvc';
import errorSvc from './errorSvc';
import mockSvc from './mockSvc';
import modelSvc from './modelSvc';
import questionAnswersSvc from './questionAnswersSvc';
import recursionHelper from './recursionHelper';
import timelineSvc from './timelineSvc';
import youtubeSvc from './youtubeSvc';
import youTubePlayerManager from './YouTubePlayerManager.svc';
import YoutubePlayerApi from './YouTubeAPI.svc';
import imageResize from './imageResizeSvc';
import ittUtils from './ittUtils';
import selectService from './selectService';

let servicesModule = angular.module('iTT.services', [])
	.factory('analyticsSvc', analyticsSvc)
	.factory('appState', appState)
	.factory('authSvc', authSvc)
	.factory('awsSvc', awsSvc)
	.factory('config', config)
	.factory('dataSvc', dataSvc)
	.factory('errorSvc', errorSvc)
	.factory('mockSvc', mockSvc)
	.factory('modelSvc', modelSvc)
	.factory('questionAnswersSvc', questionAnswersSvc)
	.factory('recursionHelper', recursionHelper)
	.factory('timelineSvc', timelineSvc)
	.factory('youtubeSvc', youtubeSvc)
	.factory('youTubePlayerManager', youTubePlayerManager)
	.service('YoutubePlayerApi', YoutubePlayerApi)
	.factory('imageResize', imageResize)
	.service('ittUtils', ittUtils)
	.factory('selectService', selectService);

export default servicesModule;
