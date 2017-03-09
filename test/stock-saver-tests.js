const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {User} = require('../users/models')
const {app, runServer, closeServer} = require('../server');
const should = chai.should();

const {TEST_DATABASE_URL} = require('../config');

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

function generateUsers() {
    const users = [
                {
            {
                "_id": {
                    "$oid": "52bfa2fe453f0048c6d3221c"
                },
                username: 'fido',
                password: 'woof',
                stocks: [
                    {
                        'stock': 'appl',
                        'price': 200,
                        "_id": {
                            "$oid": "58bf9b6d5f5cb6470bedcb5e"
                        }
                    }, {
                        'stock': 'goog',
                        'price': 1000,
                        "_id": {
                            "$oid": "58bf9b2d5f5bb6470bedcb5e"
                        }
                    }
                ]
            }, {
                {
                    "_id": {
                        "$oid": "28bfa2fe453f0048c6d3221c"
                    },
                    username: 'toto',
                    password: 'woof',
                    stocks: [
                        {
                            'stock': 'cat',
                            'price': 100,
                            "_id": {
                                "$oid": "58bf9b6d5f5bb6470eedcb5e"
                            }
                        }, {
                            'stock': 'sbux',
                            'price': 75,
                            "_id": {
                                "$oid": "58bf9b6d5f5bb6470bedcd5e"
                            }
                        }
                    ]
                }
            ]
            console.log('Creating database')
            return User.insertMany(users);
        }

        function tearDownDb() {
            console.warn('Deleting database');
            return mongoose.connection.dropDatabase();
        }

        describe('Stock Saver API', function() {
            before(function() {
                return runServer(TEST_DATABASE_URL);
            });
            beforeEach(function() {
                return generateUsers();
            });

            afterEach(function() {
                return tearDownDb();
            });
            after(function() {
                return closeServer();
            });

            describe('load HTML', function() {
                it('should load the index.html file from the root url', function() {
                    return chai.request(app).get('/').then(function(res) {
                        res.should.have.status(200);
                        res.should.be.html;
                    });
                });
                // it('should load the stocksaver.html file from the stocksaver url', function() {
                //     return chai.request(app).get('/stocksaver').then(function(res) {
                //         res.should.have.status(200);
                //         res.should.be.html;
                //     });
                // });
            });
            describe('GET endpoint', function() {
                // it('should return a user', function() {
                //     return chai.request(app).get('/users/').send({username: 'fido', password: 'woof'}).then(function(res) {
                //         res.should.have.status(200);
                //         res.should.be.json;
                //     });
                // });
            });

            describe('SIGNUP endpoint', function() {
                it('should create a user', function() {
                    const newUser = {
                        username: 'spot',
                        password: 'woof'
                    };
                    return chai.request(app).post('/signup').send(newUser).then(function(res) {
                        // res.should.have.status(201);
                        // res.should.be.json;
                        // res.should.include('username');
                    });
                });
            })

            describe('LOGIN endpoint', function() {
                it('should login a user', function() {

            })

            describe('LOGOUT endpoint', function() {
                it('should logout a user', function() {

            })

            describe('DELETE endpoint', function() {
                it('should delete a user', function() {

                    // return chai.request(app)
                    // .put('/users/:username')
                    // .send(updateUser)
                    // .then(function(res) {
                    //     res.should.have.status(201);
                    //     // res.should.be.json;
                    //     // res.should.include('username');

                });
            });
        });
