// const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')
const cookieParser = require('cookie-parser')
var flash = require('connect-flash');

const {User} = require('../users/models');

const router = express.Router();
router.use(express.static('public'));

router.use(jsonParser);
router.use(flash());

// router.use(cookieParser());
router.use(session({secret: 'hunter'}));
router.use(passport.initialize());
router.use(passport.session()); // Required for persistent login sessions (optional, but recommended)

//serialize/deserialize so that every subsequent request will not contain the user credentials
passport.serializeUser(function(user, done) {
    console.log('serialize user : ', user)
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local-signup', new LocalStrategy({
    passReqToCallback : true
}, function(req, username, password, done) {
    User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            console.log('User already exists');
            return done(null, false, req.flash('message','User Already Exists'));
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

passport.use('local-login', new LocalStrategy({
    passReqToCallback : true
}, function(req, username, password, done) {
    User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            console.log('User Not Found with username '+username);
            return done(null, false, req.flash('message', 'User Not found.'));
        }
        if (!user.isValidPassword(password)) {
            console.log('Invalid Password');
            return done(null, false, req.flash('message', 'Invalid Password'));
        }
        console.log('login req: ', req)
        return done(null, user);
    });
}));

//user signup
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/stocksaver',
    failureRedirect: '/signup',
    failureFlash : true
}))

//user login
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/stocksaver',
    failureRedirect: '/login',
    failureFlash : true
}))

//get welcome/index page
router.get('/', function(req, res, next) {
    res.render('index', {title: 'Welcome'});
});

//get login page
// router.get('/login', function(req, res, next) {
//     res.render('login', {message: req.flash('loginMessage')});
// });

//get signup page
router.get('/signup', function(req, res) {
    res.render('signup', {message: req.flash('loginMessage')});
});

//get home/stocksaver page
router.get('/stocksaver', isLoggedIn, function(req, res) {
    res.render('stocksaver', {user: req.user});
});

//get logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/stocksaver');
}

//user creation
// router.post('/', (req, res) => {
//     if (!req.body) {
//         return res.status(400).json({message: 'No request body'});
//     }
//
//     if (!('username' in req.body)) {
//         return res.status(422).json({message: 'Missing field: username'});
//     }
//
//     let {username, password, stocks} = req.body;
//
//     if (typeof username !== 'string') {
//         return res.status(422).json({message: 'Incorrect field type: username'});
//     }
//
//     username = username.trim();
//
//     if (username === '') {
//         return res.status(422).json({message: 'Incorrect field length: username'});
//     }
//
//     if (!(password)) {
//         return res.status(422).json({message: 'Missing field: password'});
//     }
//
//     if (typeof password !== 'string') {
//         return res.status(422).json({message: 'Incorrect field type: password'});
//     }
//
//     password = password.trim();
//
//     if (password === '') {
//         return res.status(422).json({message: 'Incorrect field length: password'});
//     }
//
//     // check for existing user
//     return User.find({username}).count().exec().then(count => {
//         if (count > 0) {
//             return res.status(422).json({message: 'username already taken'});
//         }
//         // if no existing user, hash password
//         return User.hashPassword(password)
//     }).then(hash => {
//         return User.create({username: username, password: hash, stocks: stocks})
//     }).then(user => {
//         // let loggedIn = true;
//         // console.log('loggedIn:', loggedIn)
//
//         return res.status(201).json(user.apiRepr());
//     }).catch(err => {
//         res.status(500).json({message: 'Internal server error'})
//     });
//
// });

//find user by username
// router.get('/:username', passport.authenticate('local', {session: false}), (req, res) => {
//     //   console.log(req.user)
//     if (req.params.username !== req.user.username) {
//         return res.status(404).json({message: 'not your user'})
//     } else {
//         res.json({user: req.user.apiRepr()})
//     }
// });
//
// //edit username by username
// router.put('/:username', passport.authenticate('local', {session: false}), (req, res) => {
//     if (!req.body) {
//         return res.status(400).json({message: 'No request body'});
//     }
//
//     if (!('username' in req.body)) {
//         return res.status(422).json({message: 'Missing field: username'});
//     }
//
//     let {username} = req.body;
//
//     if (typeof username !== 'string') {
//         return res.status(422).json({message: 'Incorrect field type: username'});
//     }
//
//     username = username.trim();
//
//     if (username === '') {
//         return res.status(422).json({message: 'Incorrect field length: username'});
//     }
//
//     return User.find({username}).count().exec().then(count => {
//         if (count > 0) {
//             return res.status(422).json({message: 'username already taken'});
//         } else {
//             User.find({username: req.params.username}).exec().then(user => {
//                 User.findByIdAndUpdate(user[0]._id, {
//                     $set: {
//                         username: username
//                     }
//                 }).exec().then(updatedUser => res.status(204).json(updatedUser.apiRepr())).catch(err => res.status(500).json({message: 'Something went wrong'}));
//             })
//         }
//     })
// });

//edit password by username
//     router.put('/:username/:password', passport.authenticate('local', {session: false}), (req, res) => {
//
//     if (!('password') in req.body) {
//       return res.status(422).json({message: 'Missing field: password'});
//     }
//
//     let {password} = req.body;
//
//     if (typeof password !== 'string') {
//       return res.status(422).json({message: 'Incorrect field type: password'});
//     }
//
//     password = password.trim();
//
//     if (password === '') {
//       return res.status(422).json({message: 'Incorrect field length: password'});
//     }
//
//     return User
//     //   .find({password})
//     //   .count()
//     //   .exec()
//     //   .then(count => {
//     //     if (count > 0) {
//     //       return res.status(422).json({message: 'password must be different'});
//     //     } else {
//          .find({username: req.params.username})
//          .exec()
//          .then(user => {
//              let newPassword = User.hashPassword(req.body.password)
//              User.findByIdAndUpdate(user[0]._id, {$set: {password: newPassword}})
//              .exec()
//              .then(updatedUser => res.status(204).json(updatedUser.apiRepr()))
//              .catch(err => res.status(500).json({message: 'Something went wrong'}));
//         })
// })

//delete user by username
//**should only allow a user to delete their own login
router.delete('/:username', passport.authenticate('local', {session: false}), (req, res) => {
    if (req.params.username !== req.user.username) {
        return res.status(404).json({message: 'not your user'})
    } else {
        return User.find({username: req.params.username}).exec().then(user => {
            // console.log(user)
            User.findByIdAndRemove(user[0]._id).exec().then(() => {
                console.log(`Deleted user ${req.params.username}`);
                res.status(204).end();
            })
        })
    }
})

//get a user's stocks
router.get('/:username/stocks', (req, res) => {
    return User.find({username: req.params.username}).exec().then(user => {
        res.status(200).json(user[0].stocks)
    })
})

//edit a user's stocks *change to findOneandUpdate?
router.put('/:username/stocks', passport.authenticate('local', {session: false}), (req, res) => {
    if (req.params.username !== req.user.username) {
        return res.status(404).json({message: 'not your user'})
    } else {
        return User.find({username: req.params.username}).exec().then(user => {
            User.findByIdAndUpdate(user[0]._id, {
                $push: {
                    stocks: req.body.stocks
                }
            })
            // , {safe: true, upsert: true, new : true})
                .exec().then(updatedUser => res.status(204).json(updatedUser.apiRepr())).catch(err => res.status(500).json({message: 'Something went wrong'}));
        })
    }
})

module.exports = {
    router
};
