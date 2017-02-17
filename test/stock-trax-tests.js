const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const should = chai.should();

const {TEST_DATABASE_URL} = require('../config');

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

function generateUser() {
    const user = {
        username: 'fido',
        password: 'woof',
        stox: ['appl', 'goog']
    }
    return user;
}


describe('Stock Trax API', function(){
    before(function() {
      return runServer();
    });
    after(function() {
      return closeServer();
    });

    describe('load HTML', function (){
        it('should load the index.html file from the root url', function(){
            return chai.request(app)
            .get('/')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.html;
            });
        });
        it('should load the stocktrax.html file from the stocktrax url', function(){
            return chai.request(app)
            .get('/stocktrax')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.html;
            });
        });
    });
    describe('GET endpoint', function () {
        it('should return users', function(){
            return chai.request(app)
            .get('/users')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
            });
        });
    });

    describe('POST endpoint', function () {
        it('should create a user', function(){
            const newUser = generateUser();
            return chai.request(app)
            .post('/users')
            .send(newUser)
            .then(function(res) {
                res.should.have.status(201);
                // res.should.be.json;
                // res.should.include('username');
            });
        });
    })
})
