'use strict';

angular.module('workspaceApp')
  .directive('viewpolls', function () {
    return {
      templateUrl: 'app/viewpolls/viewpolls.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });