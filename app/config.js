var config = {
	// Fill this in only if you need to load data from something other than the current server
	// apiDataBaseUrl: 'https://story.inthetelling.com',
	apiDataBaseUrl: 'https://demo.inthetelling.com',
	// apiDataBaseUrl: 'https://api-dev.inthetelling.com',
	// apiDataBaseUrl: 'https://api-dev-sub.inthetelling.com',

	// apiDataBaseUrl: 'https://e-literate-tv.inthetelling.com',
	// apiDataBaseUrl: 'https://gwsb.inthetelling.com',
	// apiDataBaseUrl: 'https://ewb-usa.inthetelling.com',
	// apiDataBaseUrl: 'https://purdue.inthetelling.com',
	// apiDataBaseUrl: 'https://usc-scholars.inthetelling.com',
	// apiDataBaseUrl: 'https://sustainablebizeducation.inthetelling.com',
	// apiDataBaseUrl: 'https://columbiabusinessschool.inthetelling.com',
	// apiDataBaseUrl: 'https://middlebury.inthetelling.com',

	localStorageKey: "storyToken",
	youtube: {
		disabled: false,
		timeout: 5000,
		apikey: 'AIzaSyDBU-E8lrZdKdAJ9XaVva95FuZLYoL-Tb4' // Temporary key tied to a daniel@inthetelling.com acct
	},
	disableAnalytics: false,
	debugInBrowser: true // Set this to false to make karma less noisy.  This setting will have no effect in production builds, which drop all console logs anyway. 
};
