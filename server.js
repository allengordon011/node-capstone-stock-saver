const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const jsonParser = require('body-parser').json();

const {User} = require('./models/user');
// const {router: usersRouter} = require('./routes');

const cookieParser = require('cookie-parser');
const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
var flash = require('connect-flash');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(jsonParser);
app.use(flash());
app.use(cookieParser('hunter'));
app.use(session({
    secret: 'hunter',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: (4 * 60 * 60 * 1000)
    }, // 4 hours
}));
app.use(passport.initialize());
app.use(passport.session()); // Required for persistent login sessions (optional, but recommended)

// require('./config/passport')(passport);

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config/database');

//protected endpoint
app.get('/stocksaver', isLoggedIn, function(req, res) {
    res.status(200).json({user: req.user});
});

//user logout
app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    return res.redirect('/');
});

//user signup
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/stocksaver',
    failureRedirect: '/signup',
    failureFlash: true
}))

//user login
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/stocksaver',
    failureRedirect: '/login',
    failureFlash: true
}))

//user delete
app.delete('/destroy', isLoggedIn, function(req, res, next) {
      User.findByIdAndRemove(req.user._id, {},
      function(err, obj) {
        if (err) next(err);
        req.session.destroy(function(error) {
          if (err) {
            next(err)
          }
        });
        res.json(200, obj);
    });
})

//user retrieval
app.get('/stocksaver/user', isLoggedIn, function(req, res, next) {
    // let stocks = req.user.stocks
    res.status(200).json({user: req.user});
});

//stock retrieval
app.get('/stocksaver/stocks', isLoggedIn, function(req, res, next) {
    // let stocks = req.user.stocks
    res.status(200).json({user: req.user});
});

//stock save
app.post('/stocksaver/stocks', isLoggedIn, function(req, res, next) {
    // **ADD IF STOCK EXISTS
    let id = req.user._id
    User.findByIdAndUpdate(id, {
        $push: {
            stocks: {
                stock: req.body.stock,
                price: req.body.price
            }
        }
    }, function(err, _user) {
        res.status(200).json({message: 'stock saved'});
    });
});

//stock delete
app.delete('/stocksaver/stocks', isLoggedIn, function(req, res, next) {
    let stockId = req.body.id;
    User.findById(req.user._id, function(err, res) {
        if (err) {
            console.error(err)
        }
        let stocks = res.stocks
        function findStock(stock) {
            // console.log('STOCK ID: ', typeof stock._id)
            // console.log('SEARCH ID: ', typeof stockId)
            if (stock._id.toString() === stockId) {
                return stock
            }
        }
        let stockIndex = stocks.findIndex(findStock);
        stocks.splice(stockIndex, 1);
        User.findByIdAndUpdate(req.user._id, {
            $set: {
                stocks: stocks
            }
        }, function(err, res) {
            // console.error(err)

        });
    })

    res.status(204).json({message: 'Deleted Stock.'})

})

//Check if user is logged in
function isLoggedIn(req, res, next) {
    // console.log('isLoggedIn req', req.isAuthenticated())
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.redirect('/login.html');
    }
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local-signup', new LocalStrategy(function(username, password, done) {
    //process.nextTick(function() {
    username = username.toLowerCase()
    User.findOne({username: username}).exec().then(_user => {
        let user = _user;
        if (user) {
            console.error('User already exists');
            return done(null, false, req.flash('message', 'User Already Exists'));
        } else {
            console.log('creating user');
            return User.find({username}).count().exec().then(count => {
                if (count > 0) {
                    return res.status(422).json({message: 'username already taken'});
                }
                // if no existing user, hash password
                return User.hashPassword(password)
            }).then(hash => {
                return User.create({username: username, password: hash}).then(user => {
                    // console.log(user)
                    // return user.apiRepr();
                    done(null, user);
                    // return
                });
            });
        }
    })
}));

passport.use('local-login', new LocalStrategy(function(username, password, done) {
    let user;
    username = username.toLowerCase()
    User.findOne({username: username}).exec().then(_user => {
        user = _user;
        if (!user) {
            return done(null, false, {message: 'Incorrect username'});
        }
        return user.isValidPassword(password);
    }).then(isValid => {
        if (!isValid) {
            console.log('Invalid Password');
            return done(null, false, req.flash('message', 'Invalid Password'));
        } else {
            console.log('Valid Password');
            return done(null, user);
        }
    });
}));

// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
    return new Promise((resolve, reject) => {
        mongoose.connect(DATABASE_URL, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(PORT, () => {
                console.log(`Your app is listening on port ${PORT}`);
                resolve();
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {
    app,
    runServer,
    closeServer
};
