var config = {
	localData: false, // player runs against local data if true, otherwise it runs against api data

	// Fill this in only if you need to load data from something other than the current server
	//apiDataBaseUrl: 'https://e-literate-tv.inthetelling.com', // base url for the apis when running against api data

	localDataBaseUrl: '/server-mock/data', // base url for the local data json files when running against local data

	videoJSElementId: 'vjs', // id to use for the main videojs element

	cuePointScanInterval: 25 // interval in ms when the cuePointScheduler service will perform a scan when dirty (see the service for more details).
};
