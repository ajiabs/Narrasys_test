var config = {
	localData: false, // player runs against local data if true, otherwise it runs against api data

	// NOTE WARN if you change the below field, test scripts/services/config.js which modifies this
	apiDataBaseUrl: 'https://e-literate-tv.inthetelling.com', // default base url for the apis when running against api data

	localDataBaseUrl: '/server-mock/data', // base url for the local data json files when running against local data

	videoJSElementId: 'vjs', // id to use for the main videojs element

	cuePointScanInterval: 10 // interval in ms when the cuePointScheduler service will perform a scan when dirty (see the service for more details).
};
