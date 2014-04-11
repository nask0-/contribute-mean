window.angular.module('ngff.controllers.header', [])
  .controller('HeaderController', ['$scope','Global',
    function($scope, Global) {
      $scope.global = Global;
      console.log($scope.global.isSignedIn());

      $scope.navbarEntries = [
      {
        "title": "Master View",
        "link": "masterView"
      },

    ];
    }]);