function l(topic) {
    return function() {
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
            var trip;
            beforeEach(function() {
                return tripService
                    .create('testTrip', ['a', 'b'])
            })


            it('should accept a bill and save in the entriesDB and return the id', function() {
                return tripService
                    .addBill({
                        trip: 'testTrip',
                        amount: 1,
                        splitters: ['a', 'b']
                    }).then(function(id) {
                        return entriesDB.get(id);
                    })

            })

            it('should reject if trip is not defined', function(done) {
                return tripService
                    .addBill({
                        amount: 1,
                        splitters: ['a', 'b']
                    }).then(fail('not be called', done))
                    .catch(function(err) {
                        Should.exist(err)
                        done()
                    })
            })
        })

        describe('#totals', function() {
            it('should', function() {
                tripService.add({
                    trip: 'a',
                    amount: '10',
                    splitters: ['a', 'b'],
                    payer: 'a'
                }).then(function(){
                    return tripService
                        .totals('a')
                        .then(function(data){
                            Should.exist(data)
                            data.should.have.a.lengthOf(2)
                            data.should.containDeep({})
                        })
                })
            })
        });
    })
})
