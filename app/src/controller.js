angular.module('CashSplitter.controller', [])
  .controller('TripController', function($scope, trip) {
    $scope.trip = trip
  })
  .controller('TripListController', function($scope, trips) {
    $scope.trips = trips;
  })
  .controller('TripNewController', function($scope, TripService, $state) {
    $scope.trip = {
      bills: [],
      payments: []
    };
    $scope.submit = function() {
      TripService.add($scope.trip).then(function() {
        $state.go('trip.show', {
          trip_id: $scope.trip.name
        });
      });
    };
  })
  .controller('TripShowController', function($scope, TripService, $state, entries) {
    TripService.totals($scope.trip._id).then(function(data) {
      $scope.splitted = data
    })

    $scope.entries = entries
    $scope.remove = function(trip) {
      if (confirm("Do you want to delete this trip?")) {
        TripService.remove(trip).then(function() {
          $state.go('trip_list')
        })
      }
    }
    $scope.clean = function(trip) {

      if (confirm("Do you want to delete all bills of this trip?")) {
        trip.bills = []
        trip.payments = []

        TripService.add(trip).then(function() {
          $state.go('trip.show', null, {
            reload: true
          })
        })
      }
    }
  })
  .controller('BillNewController', function($scope, TripService, $state) {
    $scope.bill = {
      creationDate: new Date(),
      _id: PouchDB.utils.uuid(),
      splitters: $scope.trip.splitters.slice(0)
    }

    $scope.submit = function() {
      $scope.bill.amount = $scope.bill.amount
      $scope.trip.bills.push($scope.bill)

      TripService.add($scope.trip).then(function() {
        $state.go('trip.show', null, {
          reload: true
        })
      })
    }

  })
  .controller('PaymentNewController', function($scope, TripService, $state) {
    $scope.payment = {
      creationDate: new Date(),
      _id: PouchDB.utils.uuid()
    }

    $scope.submit = function() {
      $scope.trip.payments.push($scope.payment)
      TripService.add($scope.trip).then(function() {
        $state.go('trip.show', null, {
          reload: true
        })
      })
    }

  })
  .controller('SplitterController', function($scope, $stateParams) {
    $scope.splitter = $stateParams.splitter
  })
  .controller('SplitterShowController', function($scope, entries) {
    $scope.entries = entries
  })
  .controller('EntryController', function($scope, entry) {
    $scope.entry = entry
  })
  .controller('EntryShowController', function($scope) {
    console.log($scope.entry)
  })
