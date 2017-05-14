(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngCookies','angularUtils.directives.dirPagination'])
        .config(config)
        .run(run)
		.controller('HeaderCtrl', HeaderCtrl)
        .controller('footerCtrl', footerCtrl)
        .factory('authInterceptor', authInterceptor);

    config.$inject = ['$routeProvider','$httpProvider', '$locationProvider'];
    function config($routeProvider,$httpProvider,$locationProvider) {
        $httpProvider.interceptors.push('authInterceptor');

        $routeProvider
            .when('/student', {
                controller: 'HomeController',
                templateUrl: 'home/home.view.html',
                controllerAs: 'vm'
            })

            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'login/login.view.html',
                controllerAs: 'vm'
            })

            .when('/register', {
                controller: 'RegisterController',
                templateUrl: 'register/register.view.html',
                controllerAs: 'vm'
            })
            .when('/EmployeeDetails',{
                controller: 'StudentDetailsController',
                templateUrl: 'studentDetails/studentdetails.view.html',
                controllerAs: 'vm'
            })

            .otherwise({ redirectTo: '/login' });
    }

    function authInterceptor($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            console.log("yamini-->"+$window.localStorage.getItem('token'));
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Basic ' + $window.localStorage.getItem('token');
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                console.log("not authorised error");
            }
            return $q.reject(rejection);
        }
    };
};

    run.$inject = ['$rootScope', '$location', '$cookies', '$http','$window'];
    function run($rootScope, $location, $cookies, $http,$window) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookies.getObject('globals') || {};
        /*console.log("$window.localStorage.getItem('token')"+$window.localStorage.getItem('token'));
        if ($window.localStorage.getItem('token')) {
            //$http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $window.localStorage.getItem('token');
            $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
        }*/

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');

            }
            //event.preventDefault();
        });
    }
	
	HeaderCtrl.$inject = ['$scope','$rootScope', '$location', '$cookies', '$http'];
    function HeaderCtrl($scope,$rootScope, $location, $cookies, $http) {
          $rootScope.$on('$locationChangeSuccess', function (event, next, current) {
		          var path = $location.path();
        //EDIT: cope with other path
		if(path==='/login' || path==='/register'){
			$scope.templateUrl = 'templates/beforeSignInHeader.tmpl.html';
		}else{
			$scope.templateUrl = 'templates/afterSignInHeader.tmpl.html';
		}
    });
    }

    footerCtrl.$inject = ['$scope','$rootScope', '$location', '$cookies', '$http'];
     function footerCtrl($scope,$rootScope, $location, $cookies, $http) {
          $rootScope.$on('$locationChangeSuccess', function (event, next, current) {
                  var path = $location.path();
        //EDIT: cope with other path
        if(path==='/login' || path==='/register'){
            $scope.templateUrl = 'templates/beforeSignInFooter.tmpl.html';
        }else{
            $scope.templateUrl = 'templates/afterSignInFooter.tmpl.html';
        }
    });
    }
})();