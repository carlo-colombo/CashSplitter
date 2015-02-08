angular.module('CashSplitter.views', [])
    .constant('views', {
        double_entry: {
            map: (function(trip) {
                trip.bills.forEach(function(bill,j) {
                    var s = bill.splitters.length;
                    if (bill.__deleted) return
                    bill.splitters.forEach(function(splitter,i) {
                        emit([trip._id, splitter,i+j], parseFloat(bill.amount / s));
                    });
                    emit([trip._id, bill.payer,-j-1], -parseFloat(bill.amount));
                });
                trip.payments.forEach(function(payment,i) {
                    !payment.__deleted && emit([trip._id, payment.source,i+10000], -parseFloat(payment.amount));
                    !payment.__deleted && emit([trip._id, payment.target,i-10000], parseFloat(payment.amount));
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
