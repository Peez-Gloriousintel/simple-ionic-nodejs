angular.module('starter')

.factory('GlobalData', function(){
    return {
      data: {
        token: '',
        username: ''
      }
    }
})

.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state, GlobalData) {
  $scope.user = {
    username: '',
    passwd: ''
  };

  $scope.login = function() {
    AuthService.login($scope.user).then(function(data) {
      GlobalData.data = {
        username: data.username,
        token: data.token
      }
      $scope.data = GlobalData.data;
      $state.go('settingPage');
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: errMsg
      });
    });
  };
})

.controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state, GlobalData) {
  $scope.user = {
    username: '',
    passwd: ''
  };

  $scope.signup = function() {
    AuthService.register($scope.user).then(function(msg) {
      $state.go('homePage.login');
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

.controller('SettingCtrl', function($scope, AuthService, API_ENDPOINT, $http, $state, GlobalData) {
  $scope.destroySession = function() {
    AuthService.logout();
  };

  $scope.logout = function() {
    AuthService.logout();
    $state.go('homePage.login');
  };

  $scope.init = function() {
    $http.get(API_ENDPOINT.url + '/userinfo' + '?username=' + GlobalData.data.username + '&token=' + GlobalData.data.token)
    .then(function(result) {
      $scope.userinfo = result.data;
      console.log($scope.userinfo);
    });
  };
})

.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, GlobalData) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('homePage.login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
});
