function l(topic) {
    return function(msg) {
        console.log.apply(console, [msg].concat(Array.prototype.slice.call(arguments, 0)))
    }
}

describe("CashSplitter", function() {
    var tripsDB,
        entriesDB;

    beforeEach(module('CashSplitter.service'))

    function fail(msg, done) {
        return function() {
            done(new Error(msg))
            return Should.fail.apply(Should, _.union([msg], arguments))
        }
    }

    describe("tripService", function() {
        var tripService, $rootScope, dbSuffix;

        beforeEach(function() {
            module(function($provide) {
                dbSuffix = PouchDB.utils.uuid()
                tripsDB = new PouchDB('CashSplitter.trips' + dbSuffix)
                entriesDB = new PouchDB('CashSplitter.entries' + dbSuffix)
                $provide.constant('tripsDB', tripsDB)
                $provide.constant('entriesDB', entriesDB)
            })

            inject(function(_tripService_, _$rootScope_, $q) {
                tripService = _tripService_
                $rootScope = _$rootScope_
                deferred = $q.defer()
            })
        });
        afterEach(function(done) {
            return tripsDB.destroy().then(function() {
                return entriesDB.destroy()
            }).then(function(res) {
                done(null, res)
            })
        })

        describe("#create", function() {
            it("should create a trip in tripsDB with name == _id ", function() {
                return tripService
                    .create('testTrip', ['a', 'b'])
                    .then(function() {
                        return tripsDB.get('testTrip')
                    }).then(function(data) {
                        data.should.be.ok
                        data.name.should.be.eql('testTrip')
                        data.should.have.property('splitters').with.lengthOf(2)
                    }, fail('there is an error'))
            })
            it("should fail to create trip with an empty name", function(done) {
                return tripService
                    .create('', ['a'])
                    .then(fail('not to be', done), function(err) {
                        Should.exist(err)
                        done()
                    })
            })


            it("should fail to create a trip with an no splitters", function(done) {
                return tripService
                    .create('testTrip', [])
                    .then(fail('not to be called', done))
                    .catch(function(err) {
                        Should.exist(err)
                        done()
                    })
            })

            it("should remove duplicates from splitters ", function() {
                return tripService
                    .create('testTrip', ['a', 'b', 'a'])
                    .then(function() {
                        return tripsDB.get('testTrip')
                    })
                    .then(function(data) {
                        data.splitters.should.have.a.lengthOf(2)
                        data.splitters.should.containEql('a')
                        data.splitters.should.containEql('b')
                    })
            })

            it('should filter out empty splitters', function() {
                return tripService
                    .create('testTrip', ['', 'a', ' '])
                    .then(function() {
                        return tripsDB.get('testTrip')
                    })
                    .then(function(data) {
                        data.splitters.should.have.a.lengthOf(1)
                        data.splitters.should.containEql('a')
                        data.splitters.should.not.containEql('')
                        data.splitters.should.not.containEql(' ')
                    })
            })

        })

        describe("#addBill", function() {
            it('should accept a bill and save in the entriesDB and return the id', function() {
                return tripService
                    .addBill({
                        trip: 'testTrip',
                        amount: 1,
                        splitters: ['a', 'b'],
                        payer: 'a'
                    }).then(function(id) {
                        return entriesDB.get(id);
                    })

            })

            it('should reject if trip is not defined', function(done) {
                return tripService
                    .addBill({
                        amount: 1,
                        splitters: ['a', 'b'],
                        payer: 'a'
                    }).then(fail('not be called', done))
                    .catch(function(err) {
                        Should.exist(err)
                        done()
                    })
            })

            it('should reject if payer is not defined', function(done) {
                return tripService
                    .addBill({
                        trip: 'a',
                        amount: 1,
                        splitters: ['a', 'b']
                    }).then(fail('not be called', done))
                    .catch(function(err) {
                        Should.exist(err)
                        done()
                    })
            })
        })

        describe("#addPayment", function() {
            it("should accept a payment and save in entriesDB and return the id", function() {
                return tripService.addPayment({
                    amount: 10,
                    source: 'a',
                    target: 'b',
                    trip: 'trip'
                }).then(function(id) {
                    return entriesDB.get(id)
                })
            })
        })

        describe('#totals', function() {
            it('should split a single entry equally between 2 splitters', function(done) {
                tripService.addBill({
                    trip: 'trip',
                    amount: 10,
                    splitters: ['a', 'b'],
                    payer: 'a'
                }).then(function() {
                    return tripService
                        .totals('trip')
                        .then(function(data) {
                            Should.exist(data)
                            data.b.should.be.eql(5)
                            data.a.should.be.eql(-5)
                            done()
                        })
                        .catch(done)
                })
            })

            it('should return 0 for a two simmetric entries', function(done) {
                var entry = {
                    trip: 'trip',
                    amount: 10,
                    splitters: ['a', 'b'],
                    payer: 'a'
                };
                tripService.addBill(entry)
                    .then(function() {
                        entry.payer = 'b'
                        return tripService.addBill(entry)
                    })
                    .then(function() {
                        return tripService
                            .totals('trip')
                            .then(function(data) {
                                Should.exist(data)
                                data.b.should.be.eql(0)
                                data.a.should.be.eql(0)
                                done()
                            })
                            .catch(done)
                    })
            })
            it('should get the right calculation for if a thrid payer pays for other 2 splitters', function(done) {
                tripService.addBill({
                    trip: 'trip',
                    amount: 10,
                    splitters: ['a', 'b'],
                    payer: 'c'
                }).then(function() {
                    return tripService
                        .totals('trip')
                        .then(function(data) {
                            Should.exist(data)
                            data.a.should.be.eql(5)
                            data.b.should.be.eql(5)
                            data.c.should.be.eql(-10)
                            done()
                        })
                        .catch(done)
                })
            })
            it('should take account of payments', function(done) {
                tripService.addBill({
                    trip: 'trip',
                    amount: 10,
                    splitters: ['a', 'b'],
                    payer: 'a'
                }).then(function() {
                    return tripService.addPayment({
                        source: 'b',
                        target: 'a',
                        amount: 5,
                        trip: 'trip'
                    })
                }).then(function() {
                    return tripService.totals('trip')
                }).then(function(data) {
                    Should.exist(data)
                    data.a.should.be.eql(0)
                    data.b.should.be.eql(0)
                    done()
                }).catch(done)
            })
        });
    })

    describe('validation', function() {
        var validator, validation
        beforeEach(inject(function(_validation_) {
            validator = new ZSchema()
            validation = _validation_
        }))

        describe('payment', function() {
            it('should accept valid payment', function() {
                var res = validator.validate({
                    source: 'a',
                    target: 'b',
                    amount: 10,
                    trip: 'tripName'
                }, validation.payment)

                res.should.be.ok
            })

            it('should validate payment', function() {
                var res = validator.validate({}, validation.payment)
                var err = validator.getLastErrors()
                res.should.be.false
                _.each(['trip','source','target','amount'], function(prop){
                    Should.exist(_.findWhere(err, {
                        params:[prop],
                        code:'OBJECT_MISSING_REQUIRED_PROPERTY'
                    }))
                })
            })

            it('should reject non numeric amount', function() {
                var res = validator.validate({
                    source: 'a',
                    target: 'b',
                    amount: 'asd',
                    trip: 'tripname'
                }, validation.payment)

                res.should.be.false
                var err = validator.getLastErrors()
                err.should.have.a.lengthOf(1)
                Should.exist(_.findWhere(err, {
                    code: 'INVALID_TYPE',
                    path: '#/amount'
                }))
            })
        })
    })
})
