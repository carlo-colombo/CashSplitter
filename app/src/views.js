angular.module('CashSplitter.views', [])
    .constant('views', {
        double_entry: {
            map: (function(bill) {
                var s = bill.splitters.length;
                if (bill.__deleted) return
                emit([bill.trip, bill.payer, -1], -parseFloat(bill.amount));
                bill.splitters.forEach(function(splitter,i) {
                    emit([bill.trip, splitter, i], parseFloat(bill.amount / s));
                });
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
