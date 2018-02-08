
export interface INpAppConfig {
  localStorageKey: 'storyToken';
  apiDataBaseUrl: string;
  youtube: { domain: string; timeout: number };
  disableAnalytics: boolean;
  debugInBrowser: boolean;
}

const env = process.env.NODE_ENV;
const url = env.prod
  ? '//' + window.location.host
  :'//np-dev.narrasys.com';

export const config: INpAppConfig = {
  localStorageKey: 'storyToken',
  apiDataBaseUrl: '//' + window.location.host,
  youtube: {
    domain: '//gdata.youtube.com/',
    timeout: 5000
  },
  disableAnalytics: false,
  debugInBrowser: true // Set this to false to make karma less noisy.
                        // This setting will have no effect in production builds, which drop all console logs anyway.
};

