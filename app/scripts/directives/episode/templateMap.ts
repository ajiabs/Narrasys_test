
import { capitalize } from '../../services/ittUtils';

const pathToImages = require.context('../../../images');
const pathToLogos = require.context('../../../images/customer');
const ittSvg = getCustomerImage('itt.svg', pathToImages);
const ittIncolorSvg = getCustomerImage('itt-incolor.svg', pathToImages);

const ittDefaults = {
  cssClass: 'itt logo',
  link: '//inthetelling.com',
  src: ittSvg,
  alt: 'In The Telling logo'
};
const BANNER_LOGO: 'banner-logo' = 'banner-logo';

export interface ITemplateData {
  pro: boolean;
  cssClass: string;
  fillClass?: string;
  logos?: {
    cssClass?: string;
    link?: string;
    src: string;
    alt?: string;
  }[];
  bannerLogo?: {
    cssClass?: string;
    src?: string;
    alt?: string;
  };
}

interface ITemplateMap {
  [templateId: string]: ITemplateData;
}

function getCustomerImage(fname: string, context = pathToLogos) {
  /*
  since we now are using a dynamic path for an ng-href,
  webpack can no longer statically analyze the HTML to
  replace the URLs with the hashed versions in production mode.
  */
  return context('./' + fname, false);
}

export const templateMap: ITemplateMap = {
  ['597127da22594d486900249b']: {
    pro: true,
    cssClass: 'professional chef-ann-foundation',
    logos: [
      { src: getCustomerImage('School_Food_Academy_Logo_Final.svg') }
    ],
    bannerLogo: null
  },
  ['57b629d522594d9c22003ef6']: {
    pro: true,
    cssClass: 'professional career-playbook',
    logos: [
      { src: getCustomerImage('CPB_Logo-01-2.svg') }
    ],
    bannerLogo: null
  },
  ['53e903a727f858072a000008']: {
    pro: false,
    cssClass: 'episode-columbia',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('columbia.svg'),
      alt: 'Columbia University'
    }
  },
  ['542da13441f6dfa6ff000025']: {
    pro: false,
    cssClass: 'episode-columbiabusiness',
    fillClass: 'trident',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('cbs-logo.svg'),
      alt: 'Columbia Business School'
    }
  },
  //special case two logos
  ['52e15b3fc9b715cfbb000005']: {
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
  ['52e15b3ec9b715cfbb000004']: {
    pro: true,
    cssClass: 'professional unbranded',
    logos: [
      {
        src: getCustomerImage('Narrasys_Banner_white.svg', pathToImages),
        link: '//narrasys.com',
        alt: 'Narrasys logo'
      }
    ],
    bannerLogo: null
  },
  ['530bc61c5539d395bd41025f']: {
    pro: false,
    cssClass: 'episode-ewb',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('ewb-logo.svg'),
      alt: 'Engineers Without Borders'
    }
  },
  ['578d686427f858d40b000d33']: {
    pro: true,
    cssClass: 'professional field-pros',
    logos: [
      { src: getCustomerImage('Logo_ColorBars-01.svg') }
    ],
    bannerLogo: null
  },
  // [templatePathPrefix + 'george-washington.html']: {
  //   pro: true,
  //   cssClass: 'george-washington',
  //   logos: [],
  //   bannerLogo: {}
  // },
  ['531898ab5539d395bd410260']: {
    pro: false,
    cssClass: 'episode-gw',
    logos: [],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('gw-logo.svg'),
      alt: 'George Washington'
    }
  },
  ['53e9035227f85827a5000005']: {
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
  ['54f8ca2727f858f7b4000298']: {
    pro: false,
    cssClass: 'episode-gwsb',
    fillClass: 'gwsb-seal',
    logos: [],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('gw-logo.svg'),
      alt: 'The George Washington University'
    }
  },
  //special case
  ['5525708b41f6df6b4c000024']: {
    pro: false,
    cssClass: 'episode-kellogg',
    logos: [
      {
        src: getCustomerImage('kellogg-k.svg')
      }
    ],
    bannerLogo: {
      cssClass: 'banner-logo' // uses images in css file
    }
  },
  ['546e50d527f858eef200000d']: {
    pro: false,
    cssClass: 'episode-middlebury',
    logos: [ //                        over-ride default logo with incolor
      Object.assign({}, ittDefaults, { src: ittIncolorSvg }),
      {
        cssClass: 'logo',
        link: 'http://middlebury.edu',
        src: getCustomerImage('middlebury-shield.svg'),
        alt: 'Middlebury logo'
      }
    ],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('middlebury-logo.svg'),
      alt: 'Middlebury'
    }
  },
  ['56e73d2e27f8580230004abc']: {
    pro: true,
    cssClass: 'professional narrasys',
    logos: [
      { src: getCustomerImage('Narrasys_brand_logo.svg') }
    ],
    bannerLogo: {
      cssClass: 'banner-logo'
    }
  },
  ['54a3034c27f8582a85000005']: {
    pro: false,
    cssClass: 'episode-prolotherapy',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('prolotherapy-text.svg'),
      alt: 'American Association of Musculoskeletal Medicine'
    }
  },
  ['539b565ebf31cd93cd000080']: {
    pro: false,
    cssClass: 'episode-purdue',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      alt: 'Purdue',
      src: getCustomerImage('purdue-logo.svg')
    }
  },
  ['5642137a41f6df55cb000c71']: {
    pro: false,
    cssClass: 'episode-regis',
    fillClass: 'bgregis',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: null
  },
  ['542da00f27f858de8f00005e']: {
    pro: false,
    cssClass: 'episode-schoolclimatesolutions',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: 'banner-logo',
      src: getCustomerImage('schoolclimatesolutions.svg'),
      alt: 'SCS: School Climate Solutions'
    }
  },
  ['story']: {
    pro: false,
    cssClass: 'episode-story',
    logos: [],
    bannerLogo: null
  },
  ['5851af7993d34f8c1200020a']: {
    pro: true,
    cssClass: 'professional university-arizona',
    logos: [
      { src: getCustomerImage('ua_horiz.svg') }
    ],
    bannerLogo: null
  },
  ['53da523abf31cd4efe000025']: {
    pro: false,
    cssClass: 'episode-usc',
    logos: [Object.assign({}, ittDefaults)],
    bannerLogo: {
      cssClass: BANNER_LOGO,
      src: getCustomerImage('usc-logo.svg')
    }
  },
  //special case - logo id
  ['56817bba27f8582c540009da']: {
    pro: false,
    cssClass: 'episode-wsbctc',
    fillClass: 'bigwsbctc',
    logos: [
      {
        cssClass: 'wsbctc-logo',
        src: '/images/customer/WSBCTC_Logo.svg"',
        alt: 'Washington SBCTC logo'
      },
      Object.assign({}, ittDefaults, { src: ittIncolorSvg }, { cssClass: 'itt-logo' })
    ],
    bannerLogo: null
  },
  //special class - div class ghost
  ['555e275241f6dfe3d1001146']: {
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
  ['555e275227f8583f8e001620']: {
    pro: false,
    cssClass: 'episode-wiley',
    logos: [
      Object.assign({}, ittDefaults)
    ],
    bannerLogo: {
      cssClass: 'ghost'
    }
  }
  // [templatePathPrefix + 'wiley3.html']: {
  //   pro: false,
  //   cssClass: 'episode-wiley wiley-endscreentext',
  //   logos: [
  //     Object.assign({}, ittDefaults)
  //   ],
  //   bannerLogo: {
  //     cssClass: 'ghost'
  //   }
  // }
};

// manually add the color, typography classes
// for these customers.
export const colorTypographyMap = {
  '52e15b3fc9b715cfbb000005': 'eliterate',
  '531898ab5539d395bd410260': 'gw',
  '54f8ca2727f858f7b4000298': 'gwsb',
  '539b565ebf31cd93cd000080': 'purdue',
  '53da523abf31cd4efe000025': 'usc',
  '53e903a727f858072a000008': 'columbia',
  '542da13441f6dfa6ff000025': 'columbiabusiness'
};

Object.entries(colorTypographyMap).forEach(([id, name]: [string, string]) => {
  templateMap[id].cssClass += ` color${capitalize(name)} typography${capitalize(name)}`;
});
