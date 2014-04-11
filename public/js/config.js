//Setting up route
window.app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/', { templateUrl: 'views/contributions/list.html' })
  .when('/contributions', { templateUrl: 'views/contributions/list.html' })
  .when('/masterView', { templateUrl: 'views/contributions/viewAll.html' })
  .when('/contributions/create', {templateUrl: 'views/contributions/create.html'})
  .when('/contributions/:contributionId/edit', {templateUrl: 'views/contributions/edit.html'})
  .when('/contributions/:contributionId', {templateUrl: 'views/contributions/view.html'})
	.otherwise({redirectTo: '/'});
}]);

//Removing tomcat unspported headers
window.app.config(['$httpProvider', function($httpProvider, Configuration) {
    //delete $httpProvider.defaults.headers.common["X-Requested-With"];
}]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider', function($locationProvider) {
    //$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix("!");
}]);