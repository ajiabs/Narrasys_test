// @npUpgrade-shared-false

// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018 
//

import { config } from '../../../config';

export interface IAuthServices {
  isTrueGuest();
  userHasRole(role);
  getCustomerIdsFromRoles();
  getRoleForNarrative(narrativeId, roles);
  getDefaultProductForRole(role);
  logout();
  adminLogin(authKey, password);
  authenticate(nonceParam);
  authenticateViaNonce(nonceParam);
  getStoredToken();
  getCurrentUser();
  updateUser(user);
  resolveUserData(data);
  getRoleDescription(roleKey);
  getNonce(nonceParam);
  getAccessToken(nonce);
}


export class AuthSvc implements IAuthServices {

  static Name = 'authSvc'; // tslint:disable-line
  static $inject = ['$routeParams', '$http', '$q', '$location', 'ittUtils', 'appState', 'modelSvc', 'errorSvc'];

  constructor (
    private $routeParams,
    private $http,
    private $q:ng.IQService,
    private $location,
    private ittUtils,
    private appState,
    private modelSvc,
    private errorSvc) {
  }

  // console.log('authSvc factory');
  private Roles = {
    ADMINISTRATOR: "admin",
    INSTRUCTOR: "instructor",
    STUDENT: "student",
    GUEST: "guest",
    CUSTOMER_ADMINISTRATOR: 'customer admin'
  };

  private Resources = {
    CUSTOMER: 'Customer'
  };

 // private _isTrueGuest = this.isTrueGuest;
  //isTrueGuest() {

  isTrueGuest() {
    var _isGuest = true;
    var context = this;
    if( this.authSvc) {
      context = this.authSvc;
    } 
    angular.forEach(context.appState.user.roles, function(r) {
      if (r.role !== context.Roles.GUEST) {
        _isGuest = false;
      }
    });

    return _isGuest;
  }

  userHasRole(role) {
    var context = this;
    if( this.authSvc) {
      context = this.authSvc;
    } 
    if (context.appState.user && context.appState.user.roles) {
      for (var i = 0; i < context.appState.user.roles.length; i++) {
        if (context.appState.user.roles[i].role === role) {
          if (!(role === context.Roles.ADMINISTRATOR && context.ittUtils.existy(context.appState.user.roles[i].resource_id))) {
            return true;
          }
        } else if (role === context.Roles.CUSTOMER_ADMINISTRATOR && context.appState.user.roles[i].role === context.Roles.ADMINISTRATOR &&
          context.ittUtils.existy(context.appState.user.roles[i].resource_id) &&
          context.appState.user.roles[i].resource_type === context.Resources.CUSTOMER) {
          return true;
        }
      }
    }
    return false;
  };

  getCustomerIdsFromRoles() {
    if (this.appState.user && this.appState.user.roles) {
      return this.appState.user.roles.reduce(function(accm, i) {
        if (i.role === this.Roles.ADMINISTRATOR &&
          this.ittUtils.existy(i.resource_id) &&
          i.resource_type === this.Resources.CUSTOMER) {
          accm.push(i.resource_id);
        }
        return accm;
      }, []);
    }
  };

  getRoleForNarrative(narrativeId, roles) {
    roles = typeof roles !== 'undefined' ? roles : this.appState.user.roles;
    var role = "";
    var exitLoop = false;
    if (roles) {
      for (var i = 0; i < roles.length; i++) {
        switch (roles[i].role) {
          case this.Roles.ADMINISTRATOR:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue; // they are an admin, but not in this narrative, so let's keep going
            } else {
              role = "admin";
              exitLoop = true; //if they are an admin, then we can just get out as it trumps
            }
            break;
          case this.Roles.INSTRUCTOR:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue;
            } else {
              role = roles[i].role;
            }
            break;
          case this.Roles.STUDENT:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue;
            } else {
              role = role === "instructor" ? role : roles[i].role;
            }
            break;
          case this.Roles.GUEST:
            if (roles[i].resource_id && roles[i].resource_id !== narrativeId) {
              continue;
            } else {
              role = role === "instructor" || role === "student" ? role : roles[i].role;
            }
            break;
        }
        if (exitLoop) {
          break;
        }
      }
    }
    return role;
  };

  getDefaultProductForRole(role) {
    /*
     This was making it impossible for users with admin role to see editor or player interface.
     For now, producer should be used only at the /#/episode urls, editor at the narrative urls
     (producer only works with individual episodes atm anyway)
     TODO later on we'll make this user-selectable within the product UI (and probably
     eliminate appState.productLoadedAs and the /#/episode, /#/editor, etc routes)
     */
    var product = "player";
    if (this.appState.productLoadedAs === 'narrative') {
      if (role === this.Roles.ADMINISTRATOR || role === this.Roles.INSTRUCTOR) {
        product = "sxs";
      }
    } else {
      this.errorSvc.error({
        data: "authSvc.getDefaultProductForRole should only be used within narratives for now"
      });
    }
    return product;
  };

  logout() {
    // Clear these even if the logout call fails (which it will if the token in localStorage has expired).
    // DO NOT clear the Authorization header yet (it's needed for the logout server call)
    var context = this;
    if( this.authSvc) {
      context = this.authSvc;
    } 
    try {
      localStorage.removeItem(config.localStorageKey);
      document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (e) {
      // user disabled cookies, so no need to try to remove them...
    }
    context.appState.user = {};

    context.$http({
      method: 'GET',
     url: config.apiDataBaseUrl + "/logout"
    })
      .success(function () {
        delete context.$http.defaults.headers.common.Authorization; // now it's safe
        context.$location.path('/')
          .search({
            logout: 1
          });
      })
      .error(function () {
        delete context.$http.defaults.headers.common.Authorization; // if it exists at all here, it's definitely invalid
        context.$location.path('/')
          .search({
            logout: 1
          });
      });
  };

  adminLogin(authKey, password) {
    var context = this;
    var defer = this.$q.defer();
    this.$http({
      method: 'POST',
      url: config.apiDataBaseUrl + "/auth/identity/callback",
      data: $.param({
        "auth_key": authKey,
        "password": password
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .success(function (data) {
        context.$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
        context.resolveUserData(data);
        context.getCurrentUser()
          .then(function () {
            defer.resolve(data);
          });

      })
      .error(function (data) {
        defer.reject(data);
      });
    return defer.promise;
  };

  /*

   authentication paths:
   header + user data: resolve immediately
   header + no user data: call show_user (this shouldn't be possible, but I coded it in at some point for some reason...)
   key in url param: call get_nonce
   token in localStorage: set header, call show_user
   nothing: get_nonce

   */

  private authenticateDefer = this.$q.defer();
  authenticate(nonceParam) {
    var context = this;

    if (this.$http.defaults.headers.common.Authorization) {
      //appState#init will initialize an empty object as the user property, which will always make
      //appState.user truthy, thus need to check to see if we actually have a loaded user by looking for the id.
      if (this.appState.user._id) {
        // Have header and user; all done.
        this.authenticateDefer.resolve();
      } else {
        // begin dubious code block
        console.warn("Have auth header but no appState.user data. Not sure this should ever happen, TODO delete this from authSvc if it continues to not happen");
        this.getCurrentUser()
          .then(function () {
            context.authenticateDefer.resolve();
          }, function () {
            return context.authenticateViaNonce(nonceParam);
          });
        // end of dubious code block
      }
    } else if (this.$routeParams.key) {
      // Have key in route
      var nonce = this.$routeParams.key;
      this.$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
      return this.getAccessToken(nonce);
    } else {
      var token = this.getStoredToken();
      if (token) {
        // have localStorage token; try it
        this.$http.defaults.headers.common.Authorization = 'Token token="' + token + '"';
        this.getCurrentUser()
          .then(function () {
            // token worked
            context.authenticateDefer.resolve();
          }, function () {
            // token expired; clear everything and start over

            try {
              localStorage.removeItem(config.localStorageKey);
              document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              document.cookie = '_tellit-api_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } catch (e) {
              // user disabled cookies
            }
            context.appState.user = {};
            return context.authenticateViaNonce(nonceParam);
          });
      } else {
        console.log('auth Via Nonce', nonceParam);
        // no login info at all, start from scratch
        return this.authenticateViaNonce(nonceParam);
      }
    }
    return context.authenticateDefer.promise;
  };

  authenticateViaNonce(nonceParam) {
    var context = this;
    var defer = this.$q.defer();
    this.getNonce(nonceParam)
      .then(function (nonce) {
        context.getAccessToken(nonce)
          .then(function () {
            defer.resolve();
          });
      });
    return defer.promise;
  };

  getStoredToken() {
    var storedData = {};
    try {
      if (!localStorage) {
        return false;
      }
      localStorage.getItem(config.localStorageKey);
      storedData = angular.fromJson(localStorage.getItem(config.localStorageKey));
      var currentCustomer = config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1];
      if (storedData.customer !== currentCustomer) {
        console.log("deleting wrong-customer token: was ", storedData.customer, " should be ", currentCustomer);
        localStorage.removeItem(config.localStorageKey);
        storedData = {};
      }
      return storedData.token || false;
    } catch (e) {
      return false;
    }

  };

  getCurrentUser() {
    var context = this;
    var defer = this.$q.defer();
    this.$http({
      method: 'GET',
      url: config.apiDataBaseUrl + '/show_user'
    })
      .success(function (respData) {
        context.resolveUserData(respData);
        defer.resolve();
      })
      .error(function () {
        defer.reject();
      });
    return defer.promise;
  };

  updateUser(user) {
    var context = this;
    var defer = this.$q.defer();
    this.$http({
      method: 'PUT',
      url: config.apiDataBaseUrl + '/users/' + user._id,
      data: user
    })
      .success(function (respData) {
        context.resolveUserData(respData);
        defer.resolve();
      })
      .error(function () {
        defer.reject();
      });
    return defer.promise;
  };

  resolveUserData(data) {
    var context = this;
    // Modify the structure of the roles data if necessary.  This is a temporary fix and can be removed after the new roles system is in place.
    if (data.roles !== null && data.roles !== undefined && data.roles.length > 0 && data.roles[0].constructor === String) {
      var roles = [];
      for (var i = 0; i < data.roles.length; i++) {
        var role = {
          role: data.roles[i]
        };
        roles.push(role);
      }
      data.roles = roles;
    }

    // updates appState.user and localStorage
    var user = {
      access_token: data.access_token || data.authentication_token,
      customer: config.apiDataBaseUrl.match(/\/\/([^\.]*)./)[1], // Access tokens are per-customer, which is based on subdomain.
      //                                                            Logging in with one customer invalidates the key for any others for the same user,
      //                                                            otherwise we'd just store separate ones per customer
      roles: data.roles
    };
    angular.forEach(["_id", "name", "email", "track_event_actions", "track_episode_metrics", "avatar_id"], function (key) {
      if (data[key]) {
        user[key] = data[key];
      }
    });

    var tok = this.getStoredToken();
    if (user.avatar_id && tok) {
      // console.log('culprit identified', tok);
      this.$http.defaults.headers.common.Authorization = 'Token token="' + tok + '"';
      // Load and cache avatar asset for current user
      this.$http.get(config.apiDataBaseUrl + "/v1/assets/" + user.avatar_id)
        .then(function (response) {
          // console.log("GOT AVATAR", response);
          context.modelSvc.cache("asset", response.data);
          context.appState.user.avatar = response.data.url; // convenience for now, may be better to use modelSvc here
        });
    }

    // API BUG workaround
    if (data["track_episode_metrics:"]) {
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
      localStorage.setItem(config.localStorageKey, JSON.stringify({
        token: user.access_token,
        customer: user.customer
      }));
    } catch (e) {}
  };

  getRoleDescription(roleKey) {
    if (roleKey === undefined) {
      return "User";
    }
    if (roleKey.role === 'admin') {
      return "Administrator";
    }
    if (roleKey.role === undefined) {
      return "User";
    }
    if (roleKey.role === "guest") {
      return "Guest user";
    }
    if (roleKey.role.match(/student/i)) {
      return "Student";
    }
    if (roleKey.role.match(/instructor/i)) {
      return "Instructor";
    }
    return roleKey;
  };

  getNonce(nonceParam) {
    var defer = this.$q.defer();
    var url = config.apiDataBaseUrl + "/v1/get_nonce";
    if (nonceParam) {
      url = url + "?" + nonceParam;
    }
    this.$http.get(url)
      .success(function (data) {
        if (data.nonce) {
          defer.resolve(data.nonce);
        } else {
          // Guest access is not allowed
          if (data.login_url && data.login_url !== null) {
            if (data.login_via_top_window_only) {
              window.top.location.href = data.login_url;
            } else {
              window.location.href = data.login_url;
            }
            defer.reject();
          } else {
            console.warn("get_nonce returned a null login_url");
            if (window.location.hash !== '#/') {
              window.location.href = "/#/";
            }
            defer.reject();
          }
        }
      })
      .error(function () {
        defer.reject();
      });
    return defer.promise;
  };

  getAccessToken(nonce) {
    var context = this;
    var defer = this.$q.defer();
    this.$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
      .success(function (data) {
        context.resolveUserData(data);
        context.$http.defaults.headers.common.Authorization = 'Token token="' + data.access_token + '"';
        context.getCurrentUser()
          .then(function () {
            defer.resolve(data);
          });
      })
      .error(function () {
        // console.error("get_access_token failed:", data, status);
        defer.reject();
      });
    return defer.promise;
  };

}
