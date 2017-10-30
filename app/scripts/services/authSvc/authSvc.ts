import { IModelSvc, Partial } from '../../interfaces';
import { existy, pick } from '../ittUtils';
import { IUser } from '../../models';

type RoleType = 'admin' | 'instructor' | 'student' | 'guest' | 'customer admin';

enum Roles {
  ADMINISTRATOR = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest',
  CUSTOMER_ADMINISTRATOR = 'customer admin'
}

enum Resources {
  CUSTOMER = 'Customer'
}

export interface IRole {
  role: RoleType;
  resource_type: string;
  resource_id: string;
}

interface ILocalStoragePayload {
  token: string;
  customer: string;
}

/* tslint:disable:variable-name */
export interface IAuthSvc {
  isTrueGuest(): boolean;
  userHasRole(role: RoleType): boolean;
  getCustomerIdsFromRoles(): string[];
  getRoleForNarrative(narrativeId: string, roles: IRole[]): RoleType | null;
  getDefaultProductForRole(role: RoleType): 'sxs' | 'player';
  logout(): void;
  adminLogin(authKey: string, password: string): ng.IPromise<any>;
  authenticate(nonceParam?: string): any;
  authenticateViaNonce(nonceParam: string): ng.IPromise<any>;
  getStoredToken(): ILocalStoragePayload['token'] | false;
  getCurrentUser(): ng.IPromise<any>;
  updateUser(user: any): ng.IPromise<any>;
  getNonce(nonceParam: string): ng.IPromise<any>;
  getAccessToken(nonce: any): ng.IPromise<any>;
}

export class AuthSvc implements IAuthSvc {
  private authenticateDefer: ng.IDeferred<any>;
  static Name = 'authSvc';
  static $inject = [
    'config',
    '$routeParams',
    '$http',
    '$q',
    '$location',
    'appState',
    'modelSvc',
    'errorSvc'
  ];

  constructor(private config,
              private $routeParams,
              private $http: ng.IHttpService,
              private $q: ng.IQService,
              private $location: ng.ILocationService,
              private appState,
              private modelSvc: IModelSvc,
              private errorSvc) {
    this.authenticateDefer = $q.defer();
  }

  isTrueGuest() {
    if (this.appState.user && this.appState.user.roles) {
      return this.appState.user.roles.some((r: IRole) => {
        return r.role !== Roles.GUEST;
      });
    }
  }

  userHasRole(role: RoleType) {
    if (this.appState.user && this.appState.user.roles) {
      for (let i = 0; i < this.appState.user.roles.length; i += 1) {
        if (this.appState.user.roles[i].role === role) {
          if (!(role === Roles.ADMINISTRATOR && existy(this.appState.user.roles[i].resource_id))) {
            return true;
          }
        } else if (role === Roles.CUSTOMER_ADMINISTRATOR && this.appState.user.roles[i].role === Roles.ADMINISTRATOR &&
          existy(this.appState.user.roles[i].resource_id) &&
          this.appState.user.roles[i].resource_type === Resources.CUSTOMER) {
          return true;
        }
      }
    }
    return false;
  }

  getCustomerIdsFromRoles() {
    if (this.appState.user && this.appState.user.roles) {
      return this.appState.user.roles.reduce(
        (accm, i) => {
          if (i.role === Roles.ADMINISTRATOR &&
            existy(i.resource_id) &&
            i.resource_type === Resources.CUSTOMER) {
            accm.push(i.resource_id);
          }
          return accm;
        },
        []
      );
    }
  }

  getRoleForNarrative(narrativeId: string, _roles: IRole[]) {
    const roles = typeof _roles !== 'undefined' ? _roles : this.appState.user.roles;
    let role;
    let exitLoop = false;
    if (roles) {
      for (let i = 0; i < roles.length; i += 1) {
        switch (roles[i].role) {
          case Roles.ADMINISTRATOR:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue; // they are an admin, but not in this narrative, so let's keep going
            } else {
              role = 'admin';
              exitLoop = true; //if they are an admin, then we can just get out as it trumps
            }
            break;
          case Roles.INSTRUCTOR:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue;
            } else {
              role = roles[i].role;
            }
            break;
          case Roles.STUDENT:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue;
            } else {
              role = role === 'instructor' ? role : roles[i].role;
            }
            break;
          case Roles.GUEST:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue;
            } else {
              role = role === 'instructor' || role === 'student' ? role : roles[i].role;
            }
            break;
        }
        if (exitLoop) {
          break;
        }
      }
    }
    return role;
  }

  getDefaultProductForRole(role: RoleType) {
    /*
 This was making it impossible for users with admin role to see editor or player interface.
 For now, producer should be used only at the /#/episode urls, editor at the narrative urls
 (producer only works with individual episodes atm anyway)
 TODO later on we'll make this user-selectable within the product UI (and probably
 eliminate appState.productLoadedAs and the /#/episode, /#/editor, etc routes)
 */
    let product: 'player' | 'sxs' = 'player';
    if (this.appState.productLoadedAs === 'narrative') {
      if (role === Roles.ADMINISTRATOR || role === Roles.INSTRUCTOR) {
        product = 'sxs';
      }
    } else {
      this.errorSvc.error({
        data: 'authSvc.getDefaultProductForRole should only be used within narratives for now'
      });
    }
    return product;
  }

  logout() {
    // Clear these even if the logout call fails (which it will if the token in localStorage has expired).
    // DO NOT clear the Authorization header yet (it's needed for the logout server call)
    try {
      localStorage.removeItem(this.config.localStorageKey);
      document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (e) {
      // user disabled cookies, so no need to try to remove them...
    }
    this.appState.user = {};

    this.$http({
      method: 'GET',
      url: this.config.apiDataBaseUrl + '/logout'
    })
      .then(() => {
        delete this.$http.defaults.headers.common.Authorization; // now it's safe
        this.$location.path('/')
          .search({
            logout: 1
          });
      })
      .catch(() => {
        delete this.$http.defaults.headers.common.Authorization; // if it exists at all here, it's definitely invalid
        this.$location.path('/')
          .search({
            logout: 1
          });
      });
  }

  adminLogin(authKey: string, password: string) {
    return this.$http({
      method: 'POST',
      url: this.config.apiDataBaseUrl + '/auth/identity/callback',
      data: $.param({
        'auth_key': authKey,
        'password': password
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((data: any) => {
        this.$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
        this.resolveUserData(data);
        return this.getCurrentUser()
          .then(() => data);
      })
      .catch((data: any) => data);
  }

  /*

   authentication paths:
   header + user data: resolve immediately
   header + no user data: call show_user(this shouldn't be possible, but I coded it in at some point for some reason..)
   key in url param: call get_nonce
   token in localStorage: set header, call show_user
   nothing: get_nonce

   */
  authenticate(nonceParam?: string) {
    if (this.$http.defaults.headers.common.Authorization) {
      //appState#init will initialize an empty object as the user property, which will always make
      //appState.user truthy, thus need to check to see if we actually have a loaded user by looking for the id.
      if (this.appState.user._id) {
        // Have header and user; all done.
        this.authenticateDefer.resolve();
      } else {
        // begin dubious code block
        console.warn(
          `Have auth header but no appState.user data. 
          Not sure this should ever happen, TODO delete this from authSvc if it continues to not happen`
        );
        this.getCurrentUser()
          .then(() => this.authenticateDefer.resolve())
          .catch(() => this.authenticateViaNonce(nonceParam));
        // end of dubious code block
      }
    } else if (this.$routeParams.key) {
      // Have key in route
      const nonce = this.$routeParams.key;
      // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
      this.$location.search('key', null);
      return this.getAccessToken(nonce);
    } else {
      const token = this.getStoredToken();
      if (token) {
        // have localStorage token; try it
        this.$http.defaults.headers.common.Authorization = 'Token token="' + token + '"';
        this.getCurrentUser()
          .then(() => this.authenticateDefer.resolve())
          .catch(() => {
            // token expired; clear everything and start over
            try {
              localStorage.removeItem(this.config.localStorageKey);
              document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } catch (e) {
              // user disabled cookies
            }
            this.appState.user = {};
            return this.authenticateViaNonce(nonceParam);
          });
      } else {
        // no login info at all, start from scratch
        return this.authenticateViaNonce(nonceParam);
      }
    }
    return this.authenticateDefer.promise;
  }

  authenticateViaNonce(nonceParam: string) {
    return this.getNonce(nonceParam)
      .then((nonce: any) => this.getAccessToken(nonce));
  }

  getStoredToken(): ILocalStoragePayload['token'] | false {
    let storedData: Partial<ILocalStoragePayload> = {};
    try {
      if (!localStorage) {
        return false;
      }
      localStorage.getItem(this.config.localStorageKey);
      storedData = angular.fromJson(localStorage.getItem(this.config.localStorageKey));
      const currentCustomer = this.config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
      if (storedData.customer !== currentCustomer) {
        console.log('deleting wrong-customer token: was ', storedData.customer, ' should be ', currentCustomer);
        localStorage.removeItem(this.config.localStorageKey);
        storedData = {};
      }
      return storedData.token || false;
    } catch (e) {
      return false;
    }
  }

  getCurrentUser() {
    console.trace('get curent user');
    return this.$http({
      method: 'GET',
      url: this.config.apiDataBaseUrl + '/show_user'
    })
      .then(resp => resp.data)
      .then((respData) => {
        this.resolveUserData(respData);
      })
      .catch((er) => {
        console.log('err', er);
      });
  }

  updateUser(user) {
    return this.$http({
      method: 'PUT',
      url: this.config.apiDataBaseUrl + '/users/' + user._id,
      data: user
    })
      .then(resp => resp.data)
      .then((respData) => {
        this.resolveUserData(respData);
      })
      .catch((e) => {
        console.log('e', e);
      });
  }

  getAccessToken(nonce) {
    return this.$http.get(this.config.apiDataBaseUrl + '/v1/get_access_token/' + nonce)
      .then(resp => resp.data)
      .then((data: any) => {
        this.resolveUserData(data);
        this.$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
        return this.getCurrentUser()
          .then(() => {
            return data;
          });
      })
      .catch((e) => {
        console.log('err getting access token', e);
      });
  }

  getNonce(nonceParam: string) {
    let url = this.config.apiDataBaseUrl + '/v1/get_nonce';
    if (nonceParam) {
      url = url + '?' + nonceParam;
    }
    return this.$http.get(url)
      .then(resp => resp.data)
      .then((data: any) => {
        if (data.nonce) {
          return data.nonce;
        } else {
          // Guest access is not allowed
          if (data.login_url && data.login_url !== null) {
            if (data.login_via_top_window_only) {
              window.top.location.href = data.login_url;
            } else {
              window.location.href = data.login_url;
            }
            return this.$q.reject();
          } else {
            console.warn('get_nonce returned a null login_url');
            if (window.location.hash !== '#/') {
              window.location.href = '/#/';
            }
            return this.$q.reject();
          }
        }
      })
      .catch((e) => {
        console.log('err getting nonce', e);
      });
  }

  private resolveUserData(data) {
    // Modify the structure of the roles data if necessary.
    // This is a temporary fix and can be removed after the new roles system is in place.
    if (data.roles !== null
      && data.roles !== undefined
      && data.roles.length > 0
      && data.roles[0].constructor === String) {
      const roles = [];
      for (let i = 0; i < data.roles.length; i += 1) {
        const role = {
          role: data.roles[i]
        };
        roles.push(role);
      }
      data.roles = roles;
    }

    // updates appState.user and localStorage
    const user: Partial<IUser> = {
      access_token: data.access_token || data.authentication_token,
      customer: this.config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1],
      // Access tokens are per-customer, which is based on subdomain.
      // Logging in with one customer invalidates the key for any others for the same user,
      // otherwise we'd just store separate ones per customer
      roles: data.roles
    };
    Object.assign(
      user,
      pick(data, ['_id', 'name', 'email', 'track_event_actions', 'track_episode_metrics', 'avatar_id'])
    );

    const tok = this.getStoredToken();
    if (user.avatar_id && tok) {
      // console.log('culprit identified', tok);
      this.$http.defaults.headers.common.Authorization = 'Token token="' + tok + '"';
      // Load and cache avatar asset for current user
      this.$http.get(this.config.apiDataBaseUrl + '/v1/assets/' + user.avatar_id)
        .then(resp => resp.data)
        .then((response: any) => {
          this.modelSvc.cache('asset', response);
          this.appState.user.avatar = response.url; // convenience for now, may be better to use modelSvc here
        });
    }

    // API BUG workaround
    if (data['track_episode_metrics:']) {
      user.track_episode_metrics = true;
    }
    if (user.roles) {
      user.role_description = this.getRoleDescription(user.roles[0]);
    }
    if (data.emails) {
      user.email = data.emails[0];
    }

    this.appState.user = user;
    try {
      localStorage.setItem(this.config.localStorageKey, JSON.stringify({
        token: user.access_token,
        customer: user.customer
      }));
    } catch (e) {
      //
    }
  }

  private getRoleDescription(roleKey) {
    if (roleKey === undefined) {
      return 'User';
    }
    if (roleKey.role === 'admin') {
      return 'Administrator';
    }
    if (roleKey.role === undefined) {
      return 'User';
    }
    if (roleKey.role === 'guest') {
      return 'Guest user';
    }
    if (roleKey.role.match(/student/i)) {
      return 'Student';
    }
    if (roleKey.role.match(/instructor/i)) {
      return 'Instructor';
    }
    return roleKey;
  }
}

/* tslint:disable */
// authSvc.$inject = ['config', '$routeParams', '$http', '$q', '$location', 'ittUtils', 'appState', 'modelSvc', 'errorSvc'];
// export default function authSvc(config, $routeParams, $http, $q, $location, ittUtils, appState, modelSvc, errorSvc) {
//   // console.log('authSvc factory');
//   var svc: IAuthSvc = Object.create(null);
//   svc.isTrueGuest = isTrueGuest;
//
//   function isTrueGuest() {
//     var _isGuest = true;
//     angular.forEach(appState.user.roles, function (r) {
//       if (r.role !== Roles.GUEST) {
//         _isGuest = false;
//       }
//     });
//
//     return _isGuest;
//   }
//
//   svc.userHasRole = function (role) {
//     if (appState.user && appState.user.roles) {
//       for (var i = 0; i < appState.user.roles.length; i++) {
//         if (appState.user.roles[i].role === role) {
//           if (!(role === Roles.ADMINISTRATOR && ittUtils.existy(appState.user.roles[i].resource_id))) {
//             return true;
//           }
//         } else if (role === Roles.CUSTOMER_ADMINISTRATOR && appState.user.roles[i].role === Roles.ADMINISTRATOR &&
//           ittUtils.existy(appState.user.roles[i].resource_id) &&
//           appState.user.roles[i].resource_type === Resources.CUSTOMER) {
//           return true;
//         }
//       }
//     }
//     return false;
//   };
//
//   svc.getCustomerIdsFromRoles = function () {
//     if (appState.user && appState.user.roles) {
//       return appState.user.roles.reduce(function (accm, i) {
//         if (i.role === Roles.ADMINISTRATOR &&
//           ittUtils.existy(i.resource_id) &&
//           i.resource_type === Resources.CUSTOMER) {
//           accm.push(i.resource_id);
//         }
//         return accm;
//       }, []);
//     }
//   };
//
//   svc.getRoleForNarrative = function (narrativeId, roles) {
//     roles = typeof roles !== 'undefined' ? roles : appState.user.roles;
//     let role;
//     let exitLoop = false;
//     if (roles) {
//       for (var i = 0; i < roles.length; i++) {
//         switch (roles[i].role) {
//           case Roles.ADMINISTRATOR:
//             if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
//               continue; // they are an admin, but not in this narrative, so let's keep going
//             } else {
//               role = 'admin';
//               exitLoop = true; //if they are an admin, then we can just get out as it trumps
//             }
//             break;
//           case Roles.INSTRUCTOR:
//             if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
//               continue;
//             } else {
//               role = roles[i].role;
//             }
//             break;
//           case Roles.STUDENT:
//             if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
//               continue;
//             } else {
//               role = role === 'instructor' ? role : roles[i].role;
//             }
//             break;
//           case Roles.GUEST:
//             if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
//               continue;
//             } else {
//               role = role === 'instructor' || role === 'student' ? role : roles[i].role;
//             }
//             break;
//         }
//         if (exitLoop) {
//           break;
//         }
//       }
//     }
//     return role;
//   };
//
//   svc.getDefaultProductForRole = function (role) {
//     /*
//      This was making it impossible for users with admin role to see editor or player interface.
//      For now, producer should be used only at the /#/episode urls, editor at the narrative urls
//      (producer only works with individual episodes atm anyway)
//      TODO later on we'll make this user-selectable within the product UI (and probably
//      eliminate appState.productLoadedAs and the /#/episode, /#/editor, etc routes)
//      */
//     var product: 'player' | 'sxs' = 'player';
//     if (appState.productLoadedAs === 'narrative') {
//       if (role === Roles.ADMINISTRATOR || role === Roles.INSTRUCTOR) {
//         product = 'sxs';
//       }
//     } else {
//       errorSvc.error({
//         data: 'authSvc.getDefaultProductForRole should only be used within narratives for now'
//       });
//     }
//     return product;
//   };
//
//   svc.logout = function () {
//     // Clear these even if the logout call fails (which it will if the token in localStorage has expired).
//     // DO NOT clear the Authorization header yet (it's needed for the logout server call)
//     try {
//       localStorage.removeItem(config.localStorageKey);
//       document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//       document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//     } catch (e) {
//       // user disabled cookies, so no need to try to remove them...
//     }
//     appState.user = {};
//
//     $http({
//       method: 'GET',
//       url: config.apiDataBaseUrl + '/logout'
//     })
//       .success(function () {
//         delete $http.defaults.headers.common.Authorization; // now it's safe
//         $location.path('/')
//           .search({
//             logout: 1
//           });
//       })
//       .error(function () {
//         delete $http.defaults.headers.common.Authorization; // if it exists at all here, it's definitely invalid
//         $location.path('/')
//           .search({
//             logout: 1
//           });
//       });
//   };
//
//   svc.adminLogin = function (authKey, password) {
//     var defer = $q.defer();
//     $http({
//       method: 'POST',
//       url: config.apiDataBaseUrl + '/auth/identity/callback',
//       data: $.param({
//         'auth_key': authKey,
//         'password': password
//       }),
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     })
//       .success(function (data) {
//         $http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
//         resolveUserData(data);
//         svc.getCurrentUser()
//           .then(function () {
//             defer.resolve(data);
//           });
//
//       })
//       .error(function (data) {
//         defer.reject(data);
//       });
//     return defer.promise;
//   };
//
//   /*
//
//    authentication paths:
//    header + user data: resolve immediately
//    header + no user data: call show_user (this shouldn't be possible, but I coded it in at some point for some reason...)
//    key in url param: call get_nonce
//    token in localStorage: set header, call show_user
//    nothing: get_nonce
//
//    */
//
//   var authenticateDefer = $q.defer();
//   svc.authenticate = function (nonceParam) {
//     if ($http.defaults.headers.common.Authorization) {
//       //appState#init will initialize an empty object as the user property, which will always make
//       //appState.user truthy, thus need to check to see if we actually have a loaded user by looking for the id.
//       if (appState.user._id) {
//         // Have header and user; all done.
//         authenticateDefer.resolve();
//       } else {
//         // begin dubious code block
//         console.warn('Have auth header but no appState.user data. Not sure this should ever happen, TODO delete this from authSvc if it continues to not happen');
//         svc.getCurrentUser()
//           .then(function () {
//             authenticateDefer.resolve();
//           }, function () {
//             return svc.authenticateViaNonce(nonceParam);
//           });
//         // end of dubious code block
//       }
//     } else if ($routeParams.key) {
//       // Have key in route
//       var nonce = $routeParams.key;
//       $location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
//       return svc.getAccessToken(nonce);
//     } else {
//       var token = svc.getStoredToken();
//       if (token) {
//         // have localStorage token; try it
//         $http.defaults.headers.common.Authorization = 'Token token="' + token + '"';
//         svc.getCurrentUser()
//           .then(function () {
//             // token worked
//             authenticateDefer.resolve();
//           }, function () {
//             // token expired; clear everything and start over
//
//             try {
//               localStorage.removeItem(config.localStorageKey);
//               document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//               document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//             } catch (e) {
//               // user disabled cookies
//             }
//             appState.user = {};
//             return svc.authenticateViaNonce(nonceParam);
//           });
//       } else {
//         console.log('auth Via Nonce', nonceParam);
//         // no login info at all, start from scratch
//         return svc.authenticateViaNonce(nonceParam);
//       }
//     }
//     return authenticateDefer.promise;
//   };
//
//   svc.authenticateViaNonce = function (nonceParam) {
//     var defer = $q.defer();
//     svc.getNonce(nonceParam)
//       .then(function (nonce) {
//         svc.getAccessToken(nonce)
//           .then(function () {
//             defer.resolve();
//           });
//       });
//     return defer.promise;
//   };
//
//   svc.getStoredToken = function () {
//     var storedData = {};
//     try {
//       if (!localStorage) {
//         return false;
//       }
//       localStorage.getItem(config.localStorageKey);
//       storedData = angular.fromJson(localStorage.getItem(config.localStorageKey));
//       var currentCustomer = config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
//       if (storedData.customer !== currentCustomer) {
//         console.log('deleting wrong-customer token: was ', storedData.customer, ' should be ', currentCustomer);
//         localStorage.removeItem(config.localStorageKey);
//         storedData = {};
//       }
//       return storedData.token || false;
//     } catch (e) {
//       return false;
//     }
//
//   };
//
//   svc.getCurrentUser = function () {
//     var defer = $q.defer();
//     $http({
//       method: 'GET',
//       url: config.apiDataBaseUrl + '/show_user'
//     })
//       .success(function (respData) {
//         resolveUserData(respData);
//         defer.resolve();
//       })
//       .error(function () {
//         defer.reject();
//       });
//     return defer.promise;
//   };
//
//   svc.updateUser = function (user) {
//     var defer = $q.defer();
//     $http({
//       method: 'PUT',
//       url: config.apiDataBaseUrl + '/users/' + user._id,
//       data: user
//     })
//       .success(function (respData) {
//         resolveUserData(respData);
//         defer.resolve();
//       })
//       .error(function () {
//         defer.reject();
//       });
//     return defer.promise;
//   };
//
//   var resolveUserData = function (data) {
//     // Modify the structure of the roles data if necessary.  This is a temporary fix and can be removed after the new roles system is in place.
//     if (data.roles !== null && data.roles !== undefined && data.roles.length > 0 && data.roles[0].constructor === String) {
//       var roles = [];
//       for (var i = 0; i < data.roles.length; i++) {
//         var role = {
//           role: data.roles[i]
//         };
//         roles.push(role);
//       }
//       data.roles = roles;
//     }
//
//     // updates appState.user and localStorage
//     var user = {
//       access_token: data.access_token || data.authentication_token,
//       customer: config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1], // Access tokens are per-customer, which is based on subdomain.
//       //                                                            Logging in with one customer invalidates the key for any others for the same user,
//       //                                                            otherwise we'd just store separate ones per customer
//       roles: data.roles
//     };
//     angular.forEach(['_id', 'name', 'email', 'track_event_actions', 'track_episode_metrics', 'avatar_id'], function (key) {
//       if (data[key]) {
//         user[key] = data[key];
//       }
//     });
//
//     var tok = svc.getStoredToken();
//     if (user.avatar_id && tok) {
//       // console.log('culprit identified', tok);
//       $http.defaults.headers.common.Authorization = 'Token token="' + tok + '"';
//       // Load and cache avatar asset for current user
//       $http.get(config.apiDataBaseUrl + '/v1/assets/' + user.avatar_id).then(function (response) {
//         // console.log("GOT AVATAR", response);
//         modelSvc.cache('asset', response.data);
//         appState.user.avatar = response.data.url; // convenience for now, may be better to use modelSvc here
//       });
//     }
//
//     // API BUG workaround
//     if (data['track_episode_metrics:']) {
//       user.track_episode_metrics = true;
//     }
//     if (user.roles) {
//       user.role_description = getRoleDescription(user.roles[0]);
//     }
//     if (data.emails) {
//       user.email = data.emails[0];
//     }
//     appState.user = user;
//     try {
//       localStorage.setItem(config.localStorageKey, JSON.stringify({
//         token: user.access_token,
//         customer: user.customer
//       }));
//     } catch (e) {
//     }
//   };
//
//   var getRoleDescription = function (roleKey) {
//     if (roleKey === undefined) {
//       return 'User';
//     }
//     if (roleKey.role === 'admin') {
//       return 'Administrator';
//     }
//     if (roleKey.role === undefined) {
//       return 'User';
//     }
//     if (roleKey.role === 'guest') {
//       return 'Guest user';
//     }
//     if (roleKey.role.match(/student/i)) {
//       return 'Student';
//     }
//     if (roleKey.role.match(/instructor/i)) {
//       return 'Instructor';
//     }
//     return roleKey;
//   };
//
//   svc.getNonce = function (nonceParam) {
//     var defer = $q.defer();
//     var url = config.apiDataBaseUrl + '/v1/get_nonce';
//     if (nonceParam) {
//       url = url + '?' + nonceParam;
//     }
//     $http.get(url)
//       .success(function (data) {
//         if (data.nonce) {
//           defer.resolve(data.nonce);
//         } else {
//           // Guest access is not allowed
//           if (data.login_url && data.login_url !== null) {
//             if (data.login_via_top_window_only) {
//               window.top.location.href = data.login_url;
//             } else {
//               window.location.href = data.login_url;
//             }
//             defer.reject();
//           } else {
//             console.warn('get_nonce returned a null login_url');
//             if (window.location.hash !== '#/') {
//               window.location.href = '/#/';
//             }
//             defer.reject();
//           }
//         }
//       })
//       .error(function () {
//         defer.reject();
//       });
//     return defer.promise;
//   };
//
//   svc.getAccessToken = function (nonce) {
//     var defer = $q.defer();
//     $http.get(config.apiDataBaseUrl + '/v1/get_access_token/' + nonce)
//       .success(function (data) {
//         resolveUserData(data);
//         $http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
//         svc.getCurrentUser()
//           .then(function () {
//             defer.resolve(data);
//           });
//       })
//       .error(function () {
//         // console.error("get_access_token failed:", data, status);
//         defer.reject();
//       });
//     return defer.promise;
//   };
//
//   return svc;
// }
