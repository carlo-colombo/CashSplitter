angular.module('CashSplitter.service', ['CashSplitter.views'])
    .constant('tripsDB', PouchDB('Cashsplitter.trips'))
    .constant('entriesDB', PouchDB('Cashsplitter.entries'))
    .provider('ngTripService', function() {
        function wrap(pouchPromise) {
            var deferred = $q.defer()


            pouchPromise.then(function(data) {
                return deferred.resolve(data)
            }, function(err) {
                return deferred.reject.apply(deferred, arguments)
            })

            return deferred.promise
        }
        return {
            $get: angular.noop
        }
    })
    .provider('tripService', function(views) {

        var db = PouchDB('CashSplitter');

        //PouchDB.debug.enable('pouchdb:api');

        function splitterAndValue(row) {
            return [
                row.key[2],
                row.value
            ]
        }

        return {
            $get: function($q, tripsDB, entriesDB) {
                return {
                    create: function(name, splitters) {
                        return new Promise(function(resolve, reject) {
                            if (splitters.length == 0) {
                                reject(new Error('No splitters found'))
                            } else {
                                resolve(
                                    tripsDB.put({
                                        _id: name,
                                        name: name,
                                        splitters: _.unique(
                                            _.filter(
                                                _.map(splitters, function(s){
                                                    return s.trim()
                                                } )))
                                    }).then(function(){
                                        return {
                                            name:name,
                                            splitters: []
                                        }
                                    })
                                )
                            }
                        })
                    },
                    addBill: function(bill) {
                        if(!bill.trip){
                            return Promise.reject('trip is not defined')
                        }
                        if(!bill.payer){
                            return Promise.reject('payer is not defined')
                        }

                        return entriesDB
                            .post(bill)
                            .then(_.property('id'))
                    },
                    get: function(id) {
                        return angular.identity(tripsDB.get(id))
                    },
                    list: function() {
                        return angular.identity(tripsDB.allDocs({
                            include_docs: true
                        }))
                    },
                    destroy: function() {
                        return angular.identity(db.destroy())
                    },
                    remove: function(trip) {
                        return angular.identity(db.remove(trip))
                    },
                    totals: function(trip_id) {
                        return angular.identity(db.query(views.double_entry, {
                            group: true,
                            startkey: [trip_id],
                            endkey: [trip_id, {}]
                        })).then(function(data) {
                            return _.zipObject(_.map(data.rows, function splitterAndValue(row) {
                                return [
                                    row.key[1],
                                    row.value
                                ]
                            }))
                        })
                    },
                    splitter_entries: function(trip_id, splitter) {
                        return angular.identity(db.query(views.trip_entries, {
                            startkey: [trip_id],
                            endkey: [trip_id, {}],
                        })).then(function(data) {
                            return _.filter(_.map(data.rows, splitterAndValue), function(row) {
                                return row[0] == splitter
                            }).reverse()
                        })
                    },
                    trip_entries: function(trip_id) {
                        return angular.identity(db.query(views.trip_entries, {
                            startkey: [trip_id],
                            endkey: [trip_id, {}],
                        })).then(function(data) {
                            return _.map(data.rows, splitterAndValue).reverse()
                        })
                    },
                    destroyDb: function() {
                        return PouchDB.destroy('CashSplitter')
                    },
                    getEntry: function(entry_id) {
                        return angular.identity(db.query(views.entries))
                            .then(function(entries) {
                                return entries.rows
                            })
                            .then(function(entries) {
                                return _.find(entries, {
                                    key: entry_id
                                })
                            })
                            .then(function(entry) {
                                return entry.value
                            })
                    }
                }
            }
        }
    })
