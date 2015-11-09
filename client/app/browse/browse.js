'use strict';

angular.module('workspaceApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/browse', {
        templateUrl: 'app/browse/browse.html',
        controller: 'BrowseCtrl'
      });
  });
