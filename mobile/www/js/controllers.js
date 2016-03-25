angular.module('starter')

.factory('global', function(){
    return {
      data: {
        token: '',
        username: ''
      }
    }
})

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state, global) {
  $scope.user = {};

  $scope.login = function() {
    AuthService.login($scope.user).then(function(data) {
      global.data = data.data;
      global.token = data.token;
      $state.go('home');
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: errMsg
      });
    });
  };
})

.controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state, global) {
  $scope.user = {};

  $scope.signup = function() {
    AuthService.register($scope.user).then(function(msg) {
      $state.go('main.login');
      var alertPopup = $ionicPopup.alert({
        title: 'Register success!',
        template: msg
      });
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Register failed!',
        template: errMsg
      });
    });
  };
})

.controller('HomeCtrl', function($scope, AuthService, $state, global) {
  $scope.userinfo = {}

  $scope.init = function() {
      $scope.userinfo = global.data;
  };

})

.controller('PasswdCtrl', function($scope, AuthService, $state, global) {
  $scope.userinfo = {}

  $scope.init = function() {
      $scope.userinfo = global.data;
  };

})

.controller('SettingCtrl', function($scope, UpdateService, QueryService, AuthService, $ionicPopup, $state, global) {

  $scope.userinfo = {
      username: '',
      firstname: '',
      lastname: '',
      email: ''
  }

  $scope.logout = function() {
    AuthService.logout();
    $state.go('main.login');
  };

  $scope.saveinfo = function() {
    UpdateService.setUserInfo(global.data.username, global.data, global.token).then(function(msg) {
      QueryService.getUserinfo(global.data.username, global.token).then(function(data) {
        $scope.userinfo = data.data;
        global.data = $scope.userinfo;

        var alertPopup = $ionicPopup.alert({
          title: 'Saved changes!',
          template: msg
        });

      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Error!',
          template: errMsg
        });
      });
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Update failed!',
        template: errMsg
      });
    });
  };

  $scope.init = function() {
    $scope.userinfo = global.data;
  };
})

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, global) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    global = {};
    $state.go('main.login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
});
