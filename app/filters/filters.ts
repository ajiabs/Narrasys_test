'use strict';

// TODO make up my mind about 'foo' versus 'isFoo'

import 'angular';
import { SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE } from '../constants';

let npFiltersModule = angular.module('np.filters', [])
/* List filters */
  .filter('itemLayout', function () {
    return function (items, layout) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.layouts && item.layouts[0] === layout) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('mainCol', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.layouts && (item.layouts[0] === 'mainBg' || item.layouts[0] === 'mainFg')) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('altCol', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.layouts && (item.layouts[0] === 'altBg' || item.layouts[0] === 'altFg')) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('annotation', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item._type === 'Annotation' && !item.templateUrl.match(/(transmedia|definition)/)) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('transmedia', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item._type !== 'Annotation' || item.templateUrl.match(/(transmedia|definition)/)) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('transcript', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.isTranscript) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('isCurrent', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.isCurrent) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('isContent', function () {
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.isContent) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('reviewMode', ['appState', function (appState) {
    return function (items) {
      var ret = [];
      var isProducer = (appState.product === 'producer');
      // player, sxs: non-cosmetic, and isContent or windowFg.
      // producer: everything.
      angular.forEach(items, function (item) {
        if (
          isProducer ||
          (!item.cosmetic &&
            (item.isContent || item.layouts.indexOf('windowFg') > -1)
          )
        ) {
          ret.push(item);
        }
      });
      return ret;
    };
  }])
  .filter('transcriptandrequired', function () {
    // returns transcript AND required transmedia:
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.isTranscript || item.required) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('transcriptandoptional', function () {
    // returns transcript AND optional transmedia
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (item.isTranscript || (!item.isTranscript && !item.required)) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('required', function () {
    // returns only required transmedia (no transcript):
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (!item.isTranscript && item.required) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  .filter('optional', function () {
    // returns only optional transmedia (no transcript)
    return function (items) {
      var ret = [];
      angular.forEach(items, function (item) {
        if (!item.isTranscript && !item.required) {
          ret.push(item);
        }
      });
      return ret;
    };
  })
  /* Single filters */

  /*
  .filter('trustAsHtml', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  })
  */
  .filter('highlightSubstring', function () {
    return function (text, search) {
      // console.log("Search highlight",text,search);
      if (!text) {
        return;
      }
      if (search || angular.isNumber(search)) {
        return text.toString().replace(new RegExp(search.toString(), 'gi'), '<span class="ui-match">$&</span>');
      } else {
        return text;
      }
    };
  })
  .filter('pretty', function () {
    return function (json) {
      return JSON.stringify(json, undefined, 2);
    };
  })
  .filter('i18n', ['appState', function (appState) {
    // Used for plugin data only; other fields precalculate into display_foo.
    // let's see if this is a huge performance hit, if not maybe we'll skip the precalc...
    return function (input) {
      if (!input) {
        return '';
      }
      if (typeof (input) === 'object') {
        return input[appState.lang] || input.en || '';
      }
      return input;
    };
  }])
  .filter('asBytes', function () {
    // quick + sloppy
    return function (b) {
      if (!b) {
        return '';
      }
      var kb = Math.floor(b / 1024);
      if (kb < 1024) {
        return kb + 'Kb';
      }
      var mb = Math.floor(kb / 10.24) / 100;
      return mb + 'Mb';
    };
  })
  .filter('asPercent', function () {
    return function (n) {
      return isNaN(n) ? (Math.floor(n * 100)) + '%' : '0%';
    };
  })
  .filter('stripParams', function () {
    return function (x) {
      return x.substr(0, x.indexOf('?'));
    };
  })
  .filter('asTime', function () {
    return function (t) {
      if (isNaN(t)) {
        return '0:00';
      }
      if (t < 0) {
        return '0:00';
      }
      return Math.floor(t / 60) + ':' + ('0' + Math.floor(t) % 60).slice(-2);
    };
  })
  .filter('alpha', function () {
    // To label ng-repeats by letter, use {{$index | alpha}}
    return function (n) {
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')[n % 26];
    };
  })
  .filter('capitalize', function () {
    return function (str) {
      return !!str ? str.charAt(0).toUpperCase() + str.substr(1).toLocaleLowerCase() : '';
    };
  })
  .filter('vidsFromCustAdmins', function () {
    //assets is actually an object when it comes in.
    return function (assets) {
      var notVideos = [];
      angular.forEach(assets, function (asset) {
        if (!/video/.test(asset.content_type)) {
          notVideos.push(asset);
        }
      });
      return notVideos;
    };
  })
  .filter('langDisplay', ['ittUtils', function (ittUtils) {
    var _existy = ittUtils.existy;
    var keys = {
      'en': 'English',
      'es': 'Spanish',
      'zh': 'Chinese',
      'pt': 'Portuguese',
      'fr': 'French',
      'de': 'German',
      'it': 'Latin'
    };
    return function (code) {
      if (_existy(code)) {
        return keys[code];
      }
      return '';
    };
  }])
  .filter('slugify', ['ittUtils', function (ittUtils) {
    return function (str) {
      if (ittUtils.existy(str)) {
        return ittUtils.slugify(str);
      }
      return '';
    };
  }])
  .filter('tagName', [() => {
    const tagMap = {
      [SOCIAL_IMAGE_SQUARE]: 'Square',
      [SOCIAL_IMAGE_WIDE]: 'Wide'
    };
    return (str) => {
      if (str && tagMap.hasOwnProperty(str)) {
        return tagMap[str];
      }
    }
  }]);

export default npFiltersModule;
