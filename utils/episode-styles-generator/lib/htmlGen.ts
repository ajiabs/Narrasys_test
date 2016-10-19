/**
 * Created by githop on 7/26/16.
 */

export const genHtml = (nameSpace, brandLogo = 'Narrasys_brand_logo.svg') => {
    return `
    <div class="episode professional ${nameSpace}" ng-class="episode.styleCss">

	<span ng-include="'templates/episode/components/reviewmode.html'"></span>
	<span ng-include="'templates/episode/components/watchmode.html'"></span>
	<span ng-repeat="scene in episode.scenes | isCurrent" ng-include="'templates/episode/components/discovermode.html'"></span>
	<span ng-include="'templates/episode/components/video.html'"></span>
	<span ng-include="'templates/episode/components/windowfg.html'"></span>

	<div ng-if="appState.viewMode != 'watch'" class="professional__branding">

		<div class="professional__copyright" ng-include="'templates/copyright.html'"></div>
		<img class="professional__logo" src="images/customer/${brandLogo}"/>
	</div>

</div>
`
};