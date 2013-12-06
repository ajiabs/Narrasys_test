var config = {
	localData: false, // player runs against local data if true, otherwise it runs against api data
	apiDataBaseUrl: "http://api-dev-sub.inthetelling.com", // base url for the apis when running against api data
	apiAuthToken: 'Token token="c7624368e407355eb587500862322413"',
	localDataBaseUrl: "/server-mock/data", // base url for the local data json files when running against local data
	videoJSElementId: "vjs", // id to use for the main videojs element
	queuePointScanInterval: 10 // interval in ms when the queuePointScheduler service
							   // will perform a scan when dirty (see the service for more details).
							   // lower numbers mean more responsiveness but potentially slower performance.
							   // 10ms is the fastest that most modern browsers are able to do screen updates.
};
