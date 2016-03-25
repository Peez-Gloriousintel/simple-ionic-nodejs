// Ionic Starter App
angular.module('starter', ['ionic'])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('main', {
    url: '/main',
    abstract: true,
    templateUrl: 'templates/main.html'
  })
  .state('main.login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('main.register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('setting', {
    url: '/setting',
    templateUrl: 'templates/setting.html',
    controller: 'SettingCtrl'
  })
  .state('passwd', {
    url: '/passwd',
    templateUrl: 'templates/password.html',
    controller: 'PasswdCtrl'
  })

  $urlRouterProvider.otherwise('/main/login');
})
.run(function($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      console.log(next.name);
      if (next.name !== 'main.login' && next.name !== 'main.register') {
        event.preventDefault();
        $state.go('main.login');
      }
    }
  });
});
