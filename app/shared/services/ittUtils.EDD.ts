// @npUpgrade-shared-false
/**
 * Created by githop on 4/22/16.
 */

  // ********************************
 // 
 // updated 2/7/18 
 // by Joseph B. and Eddie D. 
 // from Curve10
 // converted to interface->class structure
 // NOTE: had to adjust ../shared.module.ts
 //       to attach as a service and not a factory
 //
 // ***********************************************

import { Pick } from '../../interfaces';

export interface INPUtilServices {
  capitalize( str: string): string;
  bitwiseCeil(n: number): number;

  omit(obj: object, ...keys: string[]);
  stripHtmlTags(str:string): string;
  getSubdomain(host: string): string;
  existy(x: any): boolean;
  truthy(x: any): boolean; 
  generateUUID(): string;
  isValidURL(url: string): boolean;
  setNgOpts(type: string): string;
  intersection(x: number, y:number): any[];
  parseTime(t: any): string;
  renameKey(oldName: string, newName: string, obj:{}): {};
  slugify(str: string): string;
  pick(obj: any, keys: any[]): any;
}



export class NPUtilServices implements NPUtilServices {
  /*
  return {
    getSubdomain: getSubdomain,
    existy: existy,
    truthy: truthy,
    generateUUID: generateUUID,
    isValidURL: isValidURL,
    stripHtmlTags: stripHtmlTags,
    pick: pick,
    bitwiseCeil: bitwiseCeil,
    setNgOpts: setNgOpts,
    intersection: intersection,
    parseTime: parseTime,
    renameKey: renameKey,
    ngTimeout: ngTimeout,
    cancelNgTimeout: cancelNgTimeout,
    capitalize: capitalize,
    slugify: slugify
  };
  */

  static Name = "ittUtils";
  static $inject = ['$timeout'];

  constructor( private $timeout) {
  }

  // private methods
  private ngTimeout(fn, duration) {
    return this.$timeout(fn, duration || 0);
  }

  private cancelNgTimeout(fn) {
    this.$timeout.cancel(fn);
  }


capitalize(str) {
  if (this.existy(str)) {
    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
  }
}

//using bitwise operators up to 20% faster than Math.ceil (js hint not a fan of bitwise operators)
bitwiseCeil(n) {
  return n + (n < 0 ? 0 : 1) >> 0; // jshint ignore:line
}

pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (accm, field) => {
      if (this.existy(obj[field])) {
        accm[field] = angular.copy(obj[field]);
      }
      return accm;
    },
    {} as any
  );
}

omit(obj: object, ...keys: string[]) {
  return Object.keys(obj).reduce(
    (result: object, prop: string) => {
      if (keys.indexOf(prop) === -1) {
        result[prop] = obj[prop];
      }
      return result;
    },
    {}
  );
}

stripHtmlTags(str) {
  return String(str).replace(/<\/?[^>]*>/gm, '');
}

getSubdomain(host) {
  if (host.indexOf('.') < 0) {
    return null;
  } else {
    return host.split('.')[0];
  }
}

existy(x) {
  return x != null;
}

/*
 e.g. [null, undefined, '', 0, 1, false true].map(truthy)
 -> [false, false, false, false, true, false, true]
 */
truthy(x) {
  return (x != false) && this.existy(x);
}

generateUUID() {
  //js hint does not like the bitwise operators in use below.
  /* jshint ignore:start */
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
  /* jshint ignore:end */
}

isValidURL(url) {
  var URL_REGEXP = /^(((?:http)s?:\/\/)|(?:\/\/))(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;
  return URL_REGEXP.test(url);
}

//this function depends on selectSerivce, and getSelectOpts being defined on the
//controller where used.
setNgOpts(type) {
  return `option.value as option.name for option in $ctrl.getSelectOpts('${type}')`;
}

intersection(x, y) {
  var ret = [];
  for (var i = 0; i < x.length; i++) {
    for (var z = 0; z < y.length; z++) {
      if (x[i] == y[z]) { // jshint ignore:line
        ret.push(i);
        break;
      }
    }
  }
  return ret;
}

// supports these formats: "1:10", 1m10s", "1m", "10s", or a plain number (in seconds)
parseTime(t) {
  if (!isNaN(parseFloat(t)) && isFinite(t)) {
    return t;
  }
  var parse = t.match(/^(\d+)[m:]([\d\.]+)s?$/);
  if (parse) {
    return (parseFloat(parse[1] * 60) + parseFloat(parse[2]));
  }
  parse = t.match(/^([\d\.]+)s$/);
  if (parse) {
    return parseFloat(parse[1]);
  }
  parse = t.match(/^([\d\.]+)m$/);
  if (parse) {
    return parseFloat(parse[1] * 60);
  }
  console.error("Tried to parse invalid time string: ", t);
}

renameKey(oldName, newName, obj) {
  if (obj.hasOwnProperty(oldName) && !obj.hasOwnProperty(newName) && oldName !== newName) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }
}

slugify(str) {
  return str.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
}

}

export class StopWatchUtil {
  private _start: number;
  private _label: string;

  static of() {
    return new StopWatchUtil();
  }

  start(label?: string) {
    this._label = label;
    this._start = window.performance.now();
  }

  stop() {
    const end = window.performance.now();
    const prefixStr = 'Total time:';
    const message = this._label != null ? `${this._label} ${prefixStr}` : prefixStr;
    console.info(message, end - this._start);
  }
}
