const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");

const {User} = require("../models/user")
const {app, runServer, closeServer} = require("../server");
const should = chai.should();

const {TEST_DATABASE_URL} = require("../config/database");

chai.use(chaiHttp);

function generateUsers() {
    // const users = [
    //             {
    //             username: "fido",
    //             password: "woof",
    //             stocks: [
    //                     {
    //                     stock: "appl",
    //                     price: 200,
    //                     time: '3/10/2017, 11:49:21 AM',
    //                     _id: "58bf9b6d5f5cb6470bedcb5e"
    //                     }, {
    //                     stock: "goog",
    //                     price: 1000,
    //                     time: '3/10/2017, 11:49:21 AM',
    //                     _id: "58bf9b2d5f5bb6470bedcb5e"
    //                     }
    //                     ]
    //             }, {
    //             username: "toto",
    //             password: "woof",
    //             stocks: [
    //                     {
    //                     stock: "cat",
    //                     price: 100,
    //                     time: '3/10/2017, 11:49:21 AM',
    //                     _id: "58bf9b6d5f5bb6470eedcb5e"
    //                     }, {
    //                     stock: "sbux",
    //                     price: 75,
    //                     time: '3/10/2017, 11:49:21 AM',
    //                     _id: "58bf9b6d5f5bb6470bedcd5e"
    //                     }
    //                     ]
    //                 }
    //         ]
        let user1 = {
            username: "hunter",
            password: "meow"}
        console.log('Creating users')

         chai.request(app).post("/signup").send(user1).then(function(res) {
             console.log('HEY')
            // res.status(201).json({message: "test user created"})
            // return User.insertMany(users);
        }).catch(function () {
            console.error("Test User Creation - Promise Rejected")
        })
}

function tearDownDb() {
    console.warn("Deleting database");
    return mongoose.connection.dropDatabase();
}

describe("Stock Saver API", function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    // beforeEach(function() {
    //     return generateUsers();
    // });
    //
    // afterEach(function() {
    //     return tearDownDb();
    // });
    after(function() {
        return closeServer();
    });

    // describe("load HTML", function() {
    //     it("should load the index.html file from the root url", function() {
    //         return chai.request(app).get("/").then(function(res) {
    //             // res.should.have.status(200);
    //             res.should.be.html;
    //         });
    //     });
    //     // it("should load the stocksaver.html file from the stocksaver url", function() {
    //     //     return chai.request(app).get("/stocksaver").then(function(res) {
    //     //         res.should.have.status(200);
    //     //         res.should.be.html;
    //     //     });
    //     // });
    // });

    describe("SIGNUP endpoint", function() {
        it("should create a user", function() {
            const newUser = {};
            return chai.request(app).post("/signup").send("spot","woof").then(function(res) {
                console.log('SIGNUP RES1', res.body)

                // res.should.have.status(200);
                // res.should.be.html;
                // res.should.include("username");
            });
        });
        it("should return an error if user already exists", function() {
            const duplicateUser = {};
            return chai.request(app).post("/signup").send("spot","woof").then(function(res) {
                console.log('SIGNUP RES2', res.body)

                // res.should.have.status(200);
                // res.should.be.html;
                // res.should.include("exists");
            });
        });
    });

    describe("LOGIN endpoint", function() {
        it("should login a user", function() {
            return chai.request(app).get("/login").auth("spot", "woof").then(function(res) {
                // res.should.have.status(200);
                res.should.be.html;
            });
        });
    });

    describe("LOGOUT endpoint", function() {
        it("should logout a user", function() {
            return chai.request(app).get("/logout").then(function(res) {
                res.should.have.status(204);
                // res.should.be.html;
                // res.should.include("exists");
            });
        });
    })

    describe("DELETE endpoint", function() {
        it("should delete a user", function() {
            return chai.request(app)
            .delete("/destroy")
            .send("spot")
            .then(function(res) {
                console.log('DELETED RES', res.status)
                // res.should.have.status(201);
                // res.should.be.json;
                // res.should.include("username");
            });
        });
    });
})
