angular.module('CashSplitter', [
  'ui.router',
  'checklist-model',
  'CashSplitter.controller',
  'CashSplitter.service',
  'CashSplitter.directive'
])
  .run(function($locale, $rootScope, TripService, $state) {
    $locale.NUMBER_FORMATS.CURRENCY_SYM = '€'
    $locale.DATETIME_FORMATS.medium = 'dd-MM-yyyy HH:mm'
    $locale.DATETIME_FORMATS.short = 'dd-MM HH:mm'
    $locale.NUMBER_FORMATS.DECIMAL_SEP = ','
    $locale.NUMBER_FORMATS.GROUP_SEP = '.'

    $locale.NUMBER_FORMATS.PATTERNS[1] = {
      "minInt": 1,
      "minFrac": 2,
      "maxFrac": 2,
      "posPre": "¤",
      "posSuf": "",
      "negPre": "-¤",
      "negSuf": "",
      "gSize": 3,
      "lgSize": 3
    }

    $rootScope.removeDb = function() {
      if (confirm("Do you want to delete all data?")) {
        TripService.destroy().then(function() {
          $state.go('trip_list', null, {
            reload: true
          })
        }, function(err) {
          debugger
        })
      }
    }

      $rootScope.$state = $state
  })
  .config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/trip");

    var tripResolve = {
      trip: ['$stateParams', 'TripService',
        function($stateParams, TripService) {
          return TripService.get($stateParams.trip_id);
        }
      ]
    }

    $stateProvider
      .state('trip', {
        abstract: true,
        url: '/trip/:trip_id',
        views: {
          title: {
            controller: 'TripController',
            templateUrl: 'views/trip/title.html',
            resolve: tripResolve
          },
          '': {
            templateUrl: 'views/trip/layout.html',
            controller: 'TripController',
            resolve: tripResolve
          }
        }
      });



    $stateProvider
      .state('trip_list', {
        url: '/trip',
        templateUrl: 'views/trip/list.html',
        controller: 'TripListController',
        resolve: {
          trips: [
            '$stateParams',
            'TripService',
            function($stateParams, TripService) {
              return TripService.list().then(function(data) {
                return data.rows.map(function(i) {
                  return i.doc
                })
              })
            }
          ]
        }
      })
      .state('trip_new', {
        url: '/trip/new',
        templateUrl: 'views/trip/new.html',
        controller: 'TripNewController'
      })


    $stateProvider
      .state('trip.show', {
        url: '',
        templateUrl: 'views/trip/show.html',
        controller: 'TripShowController',
        resolve: {
          entries: [
            'TripService',
            '$stateParams',
            function(TripService, $stateParams) {
              return TripService.trip_entries($stateParams.trip_id)
            }
          ]
        }
      })
      .state('trip.show.bill_new', {
        url: '/bill/new',
        templateUrl: 'views/bill/new.html',
        controller: 'BillNewController'
      })
      .state('trip.show.fair_bill_new', {
        url: '/bill/fair-new',
        templateUrl: 'views/bill/fair-bill-new.html',
        controller: 'FairBillNewController'
      })
      .state('trip.show.payment_new', {
        url: '/payment/new',
        templateUrl: 'views/payment/new.html',
        controller: 'PaymentNewController'
      })
      .state('trip.show.splitter', {
        url: '/splitter/:splitter',
        abstract: true,
        templateUrl: 'views/splitter/layout.html',
        controller: 'SplitterController'
      })
      .state('trip.show.splitter.show', {
        url: '',
        templateUrl: 'views/splitter/show.html',
        controller: 'SplitterShowController',
        resolve: {
          entries: [
            'TripService',
            '$stateParams',
            function(TripService, $stateParams) {
              return TripService.splitter_entries($stateParams.trip_id, $stateParams.splitter)
            }
          ]
        }
      })
      .state('trip.show.entry', {
        url: '/entry/:entry_id',
        abstract: true,
        template: '<div ui-view></div>',
        controller: 'EntryController',
        resolve: {
          entry: [
            'TripService',
            '$stateParams',
            function(TripService, $stateParams) {
              return TripService.getEntry($stateParams.entry_id)
            }
          ]
        }
      })
      .state('trip.show.entry.show', {
        url: '/',
        controller: 'EntryShowController',
        templateUrl: 'views/entry/show.html'
      })
  })

.filter('$', function(currencyFilter) {
  return function(val) {
    return currencyFilter(val && val.toFixed ? val.toFixed(5) : val)
  }
})
