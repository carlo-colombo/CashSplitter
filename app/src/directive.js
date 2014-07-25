angular.module('CashSplitter.directive', [])
  .directive('submit', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/addBill.html',
      link: angular.noop
    }
  })
  .directive('collapse', function() {
    return {
      restrict: 'A',
      scope: {
        collapse: '='
      },
      link: function($scope, $element, $attr) {
        $scope.$watch('collapse', function(val) {
          ( !! val) ? $element.removeClass('collapse') : $element.addClass('collapse')
        })
        $element.find('a').bind('click', function() {
          $scope.collapse = false
        })
      }
    }
  })
  .directive('icon', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        name: '@'
      },
      template: '<i class="fa fa-{{name}}"></i>'
    }
  })
