'use strict';

describe('Directive: viewpolls', function () {

  // load the directive's module and view
  beforeEach(module('workspaceApp'));
  beforeEach(module('app/viewpolls/viewpolls.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<viewpolls></viewpolls>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the viewpolls directive');
  }));
});