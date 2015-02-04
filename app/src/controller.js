angular.module('CashSplitter.controller', [])
    .controller('TripController', function($scope, trip) {
        $scope.trip = trip
    })
    .controller('TripListController', function($scope, trips) {
        $scope.trips = trips;
    })
    .controller('TripNewController', function($scope, tripService, $state) {
        $scope.trip = {
            bills: [],
            payments: []
        };
        $scope.submit = function() {
            tripService.create($scope.trip.name, $scope.trip.splitters).then(function() {
                $state.go('trip.show', {
                    trip_id: $scope.trip.name
                });
            });
        };
    })
    .controller('TripShowController', function($scope, tripService, $state, entries) {
        tripService.totals($scope.trip._id).then(function(data) {
            $scope.splitted = data
        })

        $scope.entries = entries
        $scope.remove = function(trip) {
            if (confirm("Do you want to delete this trip?")) {
                tripService.remove(trip).then(function() {
                    $state.go('trip_list')
                })
            }
        }
        $scope.clean = function(trip) {

            if (confirm("Do you want to delete all bills of this trip?")) {
                trip.bills = []
                trip.payments = []

                tripService.add(trip).then(function() {
                    $state.go('trip.show', null, {
                        reload: true
                    })
                })
            }
        }

        $scope.delete = function(id) {
            if (confirm("Do you want to delete this transaction?")) {
                (_.findWhere($scope.trip.bills, {
                    _id: id
                }) || {}).__deleted = true;
                (_.findWhere($scope.trip.payments, {
                    _id: id
                }) || {}).__deleted = true;
                tripService.add($scope.trip).then(function() {
                    $state.go('trip.show', null, {
                        reload: true
                    })
                })
            }
        }
    })
    .controller('BillNewController', function($scope, tripService, $state) {
        $scope.bill = {
            trip: $scope.trip.name,
            creationDate: new Date(),
            _id: PouchDB.utils.uuid(),
            splitters: $scope.trip.splitters.slice(0)
        }

        $scope.submit = function(bill) {
            tripService.add(bill).then(function() {
                $state.go('trip.show', null, {
                    reload: true
                })
            })
        }

    })
    .controller('FairBillNewController', function($scope, tripService, $state) {
        $scope.bill = {}
        $scope.creationDate = new Date()
        $scope.sum = function(bill) {
            return _.reduce(bill, function(tot, val) {
                return parseFloat(tot) + parseFloat(val)
            })
        }
        $scope.submit = function(bill, payer) {
            _.each(
                _.map(
                    _.pick(bill, function(amount) {
                        return !!amount
                    }),
                    function(amount, splitter) {
                        return {
                            creationDate: $scope.creationDate,
                            _id: PouchDB.utils.uuid(),
                            splitters: [splitter],
                            amount: amount,
                            payer: payer,
                            description: $scope.description
                        }
                    }),
                function(bill) {
                    $scope.trip.bills.push(bill)
                })

            tripService.add($scope.trip).then(function() {
                $state.go('trip.show', null, {
                    reload: true
                })
            })
        }
    })
    .controller('PaymentNewController', function($scope, tripService, $state) {
        $scope.payment = {
            creationDate: new Date(),
            _id: PouchDB.utils.uuid()
        }

        $scope.submit = function() {
            $scope.trip.payments.push($scope.payment)
            tripService.add($scope.trip).then(function() {
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
    .controller('EntryShowController', angular.noop)
