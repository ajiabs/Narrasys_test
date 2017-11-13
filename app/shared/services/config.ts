// @npUpgrade-shared-false

config.$inject = [];

export default function config() {
  var config = window.config ? window.config : {};

  // Find out the API data url, if not specified:
  if (!config.apiDataBaseUrl) {
    config.apiDataBaseUrl = "//" + window.location.host;
  }

  if (!config.localStorageKey) {
    config.localStorageKey = "storyToken";
  }

  if (!config.youtube) {
    config.youtube = {
      domain: "//gdata.youtube.com/",
      timeout: 5000
    };
  }

  return config;
}
