angular.module('CashSplitter.views', [])
  .constant('views', {
    double_entry: {
      map: (function(trip) {
        trip.bills.forEach(function(bill) {
          var s = bill.splitters.length;
          bill.splitters.forEach(function(splitter) {
            emit([trip._id, splitter], parseFloat(bill.amount / s));
          });
          emit([trip._id, bill.payer], -parseFloat(bill.amount));
        });
        trip.payments.forEach(function(payment) {
          emit([trip._id, payment.source], -parseFloat(payment.amount));
          emit([trip._id, payment.target], parseFloat(payment.amount));
        });
      }).toString(),
      reduce: '_sum'
    },
    trip_entries: {
      map: (function(trip) {
        trip.bills.forEach(function(bill) {
          bill.type = "bill"
          emit([trip._id, bill.creationDate.toJSON(), bill.payer], bill)
        })
        trip.payments.forEach(function(payment) {
          payment.type = "payment"
          payment.description = "-> " + payment.target
          emit([trip._id, payment.creationDate.toJSON(), payment.source], payment)
        })
      }).toString()
    },
    entries: {
      map: (function(trip) {
        trip.bills.forEach(function(bill) {
          bill.type = "bill"
          emit(bill._id, bill)
        })
        trip.payments.forEach(function(payment) {
          payment.type = "payment"
          payment.description = "-> " + payment.target
          emit(payment._id, payment)
        })
      }).toString()
    }
  })
