
export interface INpAppConfig {
  localStorageKey: 'storyToken';
  apiDataBaseUrl: string;
  youtube: { domain: string; timeout: number };
  disableAnalytics: boolean;
  debugInBrowser: boolean;
}

export const config: INpAppConfig = {
  localStorageKey: 'storyToken',
  // apiDataBaseUrl: '//' + window.location.host,
  apiDataBaseUrl: '//np-dev.narrasys.com',
  youtube: {
    domain: '//gdata.youtube.com/',
    timeout: 5000
  },
  disableAnalytics: false,
  debugInBrowser: true // Set this to false to make karma less noisy.
                        // This setting will have no effect in production builds, which drop all console logs anyway.
};

