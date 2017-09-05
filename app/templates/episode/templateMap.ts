const templatePathPrefix = 'templates/episode/';
const logoPathPrefix = '../../images/customer/';

const ittSvg = getCustomerImage('itt.svg', '../../images/');
const ittIncolorSvg = getCustomerImage('itt-incolor.svg', '../../images/');

const ittDefaults = {
  cssClass: 'itt-logo',
  link: '//inthetelling.com',
  src: ittSvg,
  alt: 'In The Telling logo'
};
const BANNER_LOGO: 'banner-logo' = 'banner-logo';

interface ITemplateData {
  pro: boolean;
  cssClass: string;
  fillClass?: string;
  logos?: {
    cssClass: string;
    link?: string;
    src: string;
    alt: string;
  }[];
  bannerLogo?: {
    cssClass: string;
    src: string;
    alt: string;
  };
}

interface ITemplateMap {
  [name: string]: ITemplateData;
}

function getCustomerImage(fname: string, path: string = logoPathPrefix) {
  /*
  since we now are using a dynamic path for an ng-href,
  webpack can no longer statically analyze the HTML to
  replace the URLs with the hashed versions in production mode.
  */
  return require(`${path}${fname}`);
}

export const templateMap = {
  [templatePathPrefix + 'chef-ann-foundation.html']: {
    pro: true,
    cssClass: 'professional chef-ann-foundation',
    logos: [
      { src: getCustomerImage('School_Food_Academy_Logo_Final.svg') }
    ],
    bannerLogo: {}
  },
  [templatePathPrefix + 'career-playbook.html']: {
    pro: true,
    cssClass: 'professional career-playbook',
    logos: [
      { src: getCustomerImage('CPB_Logo-01-2.svg') }
    ],
    bannerLogo: {}
  },
  [templatePathPrefix + 'columbia.html']: {
    pro: false,
    cssClass: 'episode-columbia',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('columbia.svg'),
      alt: 'Columbia University'
    }
  },
  [templatePathPrefix + 'columbiabusiness.html']: {
    pro: false,
    cssClass: 'episode-columbiabusiness',
    hasFill: true,
    logo: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('cbs-logo.svg'),
      alt: 'Columbia Business School'
    }
  },
  //special case two logos
  [templatePathPrefix + 'eliterate.html']: {
    pro: false,
    cssClass: 'episode-eliterate',
    logos: [
      {
        cssClass: 'eliterate logo',
        link: '//www.mindwires.com',
        src: getCustomerImage('eliterate-mindwires.svg'),
        alt: 'Mindwires logo'
      },
      Object.assign({}, ittDefaults)
    ],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('eliterate-logo.svg'),
      alt: 'E-Literate'
    }
  },
  //the current default
  [templatePathPrefix + 'episode.html']: {
    pro: true,
    cssClass: 'professional unbranded',
    logos: [
      {
        src: getCustomerImage('Narrasys_Banner_white.svg'),
        link: '//narrasys.com',
        alt: 'Narrasys logo'
      }
    ],
    bannerLogo: {}
  },
  [templatePathPrefix + 'ewb.html']: {
    pro: false,
    cssClass: 'episode-ewb',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('ewb-logo.svg'),
      alt: 'Engineers Without Borders'
    }
  },
  [templatePathPrefix + 'fieldpros.html']: {
    pro: true,
    cssClass: 'professional field-pros',
    logos: [
      { src: getCustomerImage('Logo_ColorBars-01.svg') }
    ],
    bannerLogo: {}
  },
  // [templatePathPrefix + 'george-washington.html']: {
  //   pro: true,
  //   cssClass: 'george-washington',
  //   logos: [],
  //   bannerLogo: {}
  // },
  [templatePathPrefix + 'gw.html']: {
    pro: false,
    cssClass: 'episode-gw',
    logos: [],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('gw-logo.svg'),
      alt: 'George Washington'
    }
  },
  [templatePathPrefix + 'gwlaw.html']: {
    pro: false,
    cssClass: 'episode-gw',
    logos: [],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('gw-law.jpg'),
      alt: 'GW Law'
    }
  },
  //special case
  [templatePathPrefix + 'gwsb.html']: {
    pro: false,
    cssClass: 'episode-gwsb',
    logos: [],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('gw-logo.svg'),
      alt: 'The George Washington University'
    }
  },
  //special case
  [templatePathPrefix + 'kellogg.html']: {
    pro: false,
    cssClass: 'episode-kellogg',
    logos: [
      {
        src: getCustomerImage('kellogg-k.svg')
      }
    ],
    bannerLogo: {
      //set with css background-image
    }
  },
  [templatePathPrefix + 'middlebury.html']: {
    pro: false,
    cssClass: 'episode-middlebury',
    logos: [ //                        over-ride default logo with incolor
      Object.assign({}, ittDefaults, { src: ittIncolorSvg }),
      {
        cssClass: 'logo',
        link: getCustomerImage('middlebury-shield.svg'),
        src: 'http://middlebury.edu',
        alt: 'Middlebury logo'
      }
    ],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('middlebury-logo.svg'),
      alt: 'Middlebury'
    }
  },
  [templatePathPrefix + 'narrasys-pro.html']: {
    pro: true,
    cssClass: 'professional narrasys',
    logos: [
      { src: getCustomerImage('Narrasys_brand_logo.svg') }
    ],
    bannerLogo: {}
  },
  [templatePathPrefix + 'prolotherapy.html']: {
    pro: false,
    cssClass: 'episode-prolotherapy',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('prolotherapy-text.svg'),
      alt: 'American Association of Musculoskeletal Medicine'
    }
  },
  [templatePathPrefix + 'purdue.html']: {
    pro: false,
    cssClass: 'episode-purdue',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      alt: 'Purdue',
      src: getCustomerImage('purdue-logo.svg')
    }
  },
  [templatePathPrefix + 'regis.html']: {
    pro: false,
    cssClass: 'episode-regis',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: null
  },
  [templatePathPrefix + 'schoolclimatesolutions.html']: {
    pro: false,
    cssClass: 'episode-schoolclimatesolutions',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: 'banner-logo',
      src: getCustomerImage('schoolclimatesolutions.svg'),
      alt: 'SCS: School Climate Solutions'
    }
  },
  [templatePathPrefix + 'story.html']: {
    pro: false,
    cssClass: 'episode-story',
    logos: [],
    bannerLogo: {}
  },
  [templatePathPrefix + 'university-arizona.html']: {
    pro: true,
    cssClass: 'professional university-arizona',
    logos: [
      { src: getCustomerImage('ua_horiz.svg') }
    ],
    bannerLogo: {}
  },
  [templatePathPrefix + 'usc.html']: {
    pro: false,
    cssClass: 'episode-usc',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('usc-logo.svg')
    }
  },
  //special case - logo id
  [templatePathPrefix + 'washingtonSBCTC.html']: {
    pro: false,
    cssClass: 'episode-wsbctc',
    logos: [
      {
        cssClass: 'wsbctc-logo',
        src: '/images/customer/WSBCTC_Logo.svg"',
        alt: 'Washington SBCTC logo'
      },
      Object.assign({}, ittDefaults, { src: ittIncolorSvg })
    ],
    bannerLogo: null
  },
  //special class - div class ghost
  [templatePathPrefix + 'wiley1.html']: {
    pro: false,
    cssClass: 'episode-wiley wiley-endscreentext',
    logos: [
      Object.assign({}, ittDefaults)
    ],
    bannerLogo: {
      cssClass: 'ghost'
    }
  },
  //special case - div class ghost
  [templatePathPrefix + 'wiley2.html']: {
    pro: false,
    cssClass: 'episode-wiley',
    logos: [
      Object.assign({}, ittDefaults)
    ],
    bannerLogo: {
      cssClass: 'ghost'
    }
  },
  [templatePathPrefix + 'wiley3.html']: {
    pro: false,
    cssClass: 'episode-wiley wiley-endscreentext',
    logos: [
      Object.assign({}, ittDefaults)
    ],
    bannerLogo: {
      cssClass: 'ghost'
    }
  }
} as ITemplateMap;
