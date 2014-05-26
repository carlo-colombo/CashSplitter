angular.module('CashSplitter.controller', []).controller('TripController', [
  '$scope',
  'trip',
  function ($scope, trip) {
    $scope.trip = trip;
  }
]).controller('TripListController', [
  '$scope',
  'trips',
  function ($scope, trips) {
    $scope.trips = trips;
  }
]).controller('TripNewController', [
  '$scope',
  'TripService',
  '$state',
  function ($scope, TripService, $state) {
    $scope.trip = {
      bills: [],
      payments: []
    };
    $scope.submit = function () {
      TripService.add($scope.trip).then(function () {
        $state.go('trip.show', { trip_id: $scope.trip.name });
      });
    };
  }
]).controller('TripShowController', [
  '$scope',
  'TripService',
  '$state',
  'entries',
  function ($scope, TripService, $state, entries) {
    TripService.totals($scope.trip._id).then(function (data) {
      $scope.splitted = data;
    });
    $scope.entries = entries;
    $scope.remove = function (trip) {
      if (confirm('Do you want to delete this trip?')) {
        TripService.remove(trip).then(function () {
          $state.go('trip_list');
        });
      }
    };
    $scope.clean = function (trip) {
      if (confirm('Do you want to delete all bills of this trip?')) {
        trip.bills = [];
        trip.payments = [];
        TripService.add(trip).then(function () {
          $state.go('trip.show', null, { reload: true });
        });
      }
    };
  }
]).controller('BillNewController', [
  '$scope',
  'TripService',
  '$state',
  function ($scope, TripService, $state) {
    $scope.bill = {
      creationDate: new Date(),
      _id: PouchDB.utils.uuid(),
      splitters: $scope.trip.splitters.slice(0)
    };
    $scope.submit = function () {
      $scope.bill.amount = $scope.bill.amount;
      $scope.trip.bills.push($scope.bill);
      TripService.add($scope.trip).then(function () {
        $state.go('trip.show', null, { reload: true });
      });
    };
  }
]).controller('PaymentNewController', [
  '$scope',
  'TripService',
  '$state',
  function ($scope, TripService, $state) {
    $scope.payment = {
      creationDate: new Date(),
      _id: PouchDB.utils.uuid()
    };
    $scope.submit = function () {
      $scope.trip.payments.push($scope.payment);
      TripService.add($scope.trip).then(function () {
        $state.go('trip.show', null, { reload: true });
      });
    };
  }
]).controller('SplitterController', [
  '$scope',
  '$stateParams',
  function ($scope, $stateParams) {
    $scope.splitter = $stateParams.splitter;
  }
]).controller('SplitterShowController', [
  '$scope',
  'entries',
  function ($scope, entries) {
    $scope.entries = entries;
  }
]).controller('EntryController', [
  '$scope',
  'entry',
  function ($scope, entry) {
    $scope.entry = entry;
  }
]).controller('EntryShowController', [
  '$scope',
  function ($scope) {
    console.log($scope.entry);
  }
]);