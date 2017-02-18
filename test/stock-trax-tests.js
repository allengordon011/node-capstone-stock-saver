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
            username: 'fido',
            password: 'woof',
            stox: ['appl', 'goog']
        }, {
            username: 'toto',
            password: 'woof',
            stox: ['lmht', 'xyz']
        }
    ]
    console.log('Creating database')
    return User.insertMany(users);
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Stock Trax API', function() {
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
        it('should load the stocktrax.html file from the stocktrax url', function() {
            return chai.request(app).get('/stocktrax').then(function(res) {
                res.should.have.status(200);
                res.should.be.html;
            });
        });
    });
    describe('GET endpoint', function() {
        it('should return a user', function() {
            return chai.request(app).get('/users/').send({username: 'fido', password: 'woof'}).then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
            });
        });
    });

    describe('POST endpoint', function() {
        it('should create a user', function() {
            const newUser = {
                username: 'spot',
                password: 'woof',
                stox: ['abc', 'def']
            };
            return chai.request(app).post('/users').send(newUser).then(function(res) {
                res.should.have.status(201);
                // res.should.be.json;
                // res.should.include('username');
            });
        });
    })
    describe('PUT endpoint', function() {
        it('should edit a username', function() {
            const updateData = {
                username: 'spike'
            };
            // return chai.request(app)
            // .put('/users/:username')
            // .send(updateUser)
            // .then(function(res) {
            //     res.should.have.status(201);
            //     // res.should.be.json;
            //     // res.should.include('username');

            return User.findOne().exec().then(function(user) {
                console.log('PUT: USER', user)
                updateData.id = user._id;
                return chai.request(app).put(`/users/${user.id}`).send({
                    password: 'woof'
                }, updateData);
            }).then(function(res) {
                res.should.have.status(204);

                return User.findById(updateData.id).exec();
            }).then(function(user) {
                user.username.should.equal(updateData.title);
            });
        });
    });
});
