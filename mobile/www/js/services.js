angular.module('starter')

 .service('QueryService', function($q, $http, API_ENDPOINT) {

   $http.defaults.headers.post["Content-Type"] = "application/json";

   var getUserinfo = function(username, token) {
     return $q(function(resolve, reject){
       $http.get(API_ENDPOINT.url + '/userinfo' + '?username=' + username + '&token=' + token)
       .then(function(result) {
         if (result.data.success) {
           resolve(result.data);
         } else {
           reject(result.data.message);
         }
       });
     });
   };

   return {
     getUserinfo: getUserinfo
   };
 })

 .service('UpdateService', function($q, $http, API_ENDPOINT) {

   $http.defaults.headers.post["Content-Type"] = "application/json";

   var setUserInfo = function(username, userinfo, token) {
     user = userinfo;
     user.username = username;
     user.token = token;
     return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/update', user)
        .then(function(result) {
          if (result.data.success) {
            resolve(result.data.message);
          } else {
            reject(result.data.message);
          }
        });
     });
   };

   return {
     setUserInfo: setUserInfo
   };
 })

 .service('AuthService', function($q, $http, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = '';
  var isAuthenticated = false;
  var authToken;

  $http.defaults.headers.post["Content-Type"] = "application/json";

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;

    $http.defaults.headers.common.Authorization = authToken;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var register = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/regis', user).then(function(result) {
        if (result.data.success) {
          resolve(result.data.message);
        } else {
          reject(result.data.message);
        }
      });
    });
  };

  var login = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/authen', user).then(function(result) {
        if (result.data.success) {
          storeUserCredentials(result.data.token);
          resolve(result.data);
        } else {
          reject(result.data.message);
        }
      });
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    login: login,
    register: register,
    logout: logout,
    isAuthenticated: function() {return isAuthenticated;},
  };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
