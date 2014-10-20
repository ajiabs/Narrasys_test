var config = {
	// Fill this in only if you need to load data from something other than the current server
	// apiDataBaseUrl: 'https://e-literate-tv.inthetelling.com',
	// apiDataBaseUrl: 'https://api-dev-sub.inthetelling.com',
	// apiDataBaseUrl: 'https://gwsb.inthetelling.com',
	// apiDataBaseUrl: 'https://ewb-usa.inthetelling.com',
	// apiDataBaseUrl: 'https://story.inthetelling.com',
	// apiDataBaseUrl: 'https://purdue.inthetelling.com',
	// apiDataBaseUrl: 'https://usc-scholars.inthetelling.com',

	// NOTE this build uses v3 endpoints which currently are only on the dev server:
	apiDataBaseUrl: 'https://api-dev-sub.inthetelling.com',
	// apiDataBaseUrl: 'https://demo.inthetelling.com',
	localStorageKey: "storyKey",
	disableYoutube: true,
	disableAnalytics: true,
	debugInBrowser: true, // Set this to false to make karma less noisy.  This setting will have no effect in production builds, which drop all console logs anyway. 
	awsRegion: 'us-east-1'
};
