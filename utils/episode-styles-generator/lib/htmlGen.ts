/**
 * Created by githop on 7/26/16.
 */

const ittCopyright = `<div class="professional__copyright" ng-include="'templates/copyright.html'"></div>`;
const narrasysCopyright = `<nys-copyright class="professional__copyright"></nys-copyright>`;
const handleCopyright = (nameSpace:string) => {
	if (nameSpace === 'george-washington') {
		return ittCopyright;
	}
	return narrasysCopyright;
};

const handleBrandImg = (brandLogo:string, nameSpace:string) => {
	if (brandLogo === 'none') {
		return '';
	}
	if (nameSpace === 'unbranded') {
		return `
<a class="professional__logo" href="//narrasys.com" target="_blank">
	<img src="/images/${brandLogo}" alt="In The Telling logo">
</a>`
	}
	return `<img class="professional__logo" src="images/customer/${brandLogo}"/>`
};

const handleFooterClass = (nameSpace:string) => {
	if (nameSpace === 'unbranded') {
		return `professional__branding branding footer`;
	}

	return 'professional__branding';
};

export const genHtml = (nameSpace:string, brandLogo:string = 'Narrasys_brand_logo.svg') => {
    return `
<div class="episode professional ${nameSpace}" ng-class="episode.styleCss">

  <span ng-include="'templates/episode/components/reviewmode.html'"></span>
  <span ng-include="'templates/episode/components/watchmode.html'"></span>
  <span ng-repeat="scene in currScene = (episode.scenes | isCurrent)"
        ng-include="'templates/episode/components/discovermode.html'"></span>
  <itt-video-container episode="episode" hide-video="currScene[0].hide_video"></itt-video-container>
  <span ng-include="'templates/episode/components/windowfg.html'"></span>
	
	<div ng-if="appState.viewMode != 'watch'" class="${handleFooterClass(nameSpace)}">
		<div class="branding--content">
			${handleCopyright(nameSpace)}
			${handleBrandImg(brandLogo, nameSpace)}
		</div>
	</div>
</div>
`;
};
