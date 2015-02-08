angular.module('CashSplitter.service', ['CashSplitter.views'])
  .provider('TripService', function(views) {

    var db = PouchDB('CashSplitter')

      function splitterAndValue(row) {
        return [
          row.key[2],
          row.value
        ]
      }

    return {
      $get: function($q) {

        function wrap(pouchPromise) {
          var deferred = $q.defer()

          pouchPromise.then(function(data) {
            return deferred.resolve.apply(deferred, arguments)
          }, function(err) {
            console.err(err)
            return deferred.reject.apply(deferred, arguments)
          })

          return deferred.promise
        }

        return {
          add: function(trip) {
            _.each(trip.bills, function(bill) {
              bill.amount = parseFloat(bill.amount)
            })
            return wrap(db.put(trip, trip.name))
          },
          get: function(id) {
            return wrap(db.get(id)).then(function(trip) {

              trip.total = _.reduce(trip.bills, function(acc, bill) {
                return acc + parseFloat(bill.amount)
              }, 0)

              return trip
            })
          },
          list: function() {
            return wrap(db.allDocs({
              include_docs: true
            }))
          },
          destroy: function() {
            return wrap(db.destroy())
          },
          remove: function(trip) {
            return wrap(db.remove(trip))
          },
          totals: function(trip_id) {
            return wrap(db.query(views.double_entry, {
              group: true,
              startkey: [trip_id],
              group_level: 2,
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
            return wrap(db.query(views.trip_entries, {
              startkey: [trip_id],
              endkey: [trip_id, {}],
            })).then(function(data) {
              return _.filter(_.map(data.rows, splitterAndValue), function(row) {
                return row[0] == splitter
              }).reverse()
            })
          },
          trip_entries: function(trip_id) {
            return wrap(db.query(views.trip_entries, {
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
            return wrap(db.query(views.entries))
              .then(function(entries) {
                return entries.rows
              })
              .then(function(entries) {
                return _.find(entries, {
                  key: entry_id
                })
              })
              .then(function (entry) {
                return entry.value
              })
          }
        }
      }
    }
  })
