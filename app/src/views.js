angular.module('CashSplitter.views', [])
    .constant('views', {
        double_entry: {
            map: (function(entry) {
                if (entry.__deleted) return
                if (entry.type == 'bill') {
                    var length = entry.splitters.length;
                    emit([entry.trip, entry.payer, -1], -parseFloat(entry.amount));
                    entry.splitters.forEach(function(splitter, i) {
                        emit([entry.trip, splitter, i], parseFloat(entry.amount / length));
                    });
                }
                if (entry.type == 'payment') {
                    emit([entry.trip, entry.source], -parseFloat(entry.amount))
                    emit([entry.trip, entry.target], +parseFloat(entry.amount))
                }
            }).toString(),
            reduce: '_sum'
        },
        trip_entries: {
            map: (function(trip) {
                trip.bills.forEach(function(bill) {
                    bill.type = "bill";
                    !bill.__deleted && emit([trip._id, new Date(bill.creationDate).toJSON(), bill.payer], bill);
                })
                trip.payments.forEach(function(payment) {
                    payment.type = "payment"
                    payment.description = "-> " + payment.target;
                    !payment.__deleted && emit([trip._id, new Date(payment.creationDate).toJSON(), payment.source], payment)
                })
            }).toString()
        },
        entries: {
            map: (function(trip) {
                trip.bills.forEach(function(bill) {
                    bill.type = "bill";
                    !bill.__deleted && emit(bill._id, bill)
                })
                trip.payments.forEach(function(payment) {
                    payment.type = "payment"
                    payment.description = "-> " + payment.target;
                    !payment.__deleted && emit(payment._id, payment)
                })
            }).toString()
        }
    })
