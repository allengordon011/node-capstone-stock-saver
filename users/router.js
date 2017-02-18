// const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')

const {User} = require('./models');

const router = express.Router();

router.use(jsonParser);

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// passport.use(localStrategy);
// router.use(express.cookieParser());
// router.use(express.session({ secret: 'keyboard cat' }));
router.use(passport.initialize());
// router.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//user login
router.post('/login',
  passport.authenticate('local', { successRedirect: '/stocksaver',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

//user creation
router.post('/', passport.authenticate('local', { successRedirect: '/stocksaver', failureRedirect: '/' }), (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.status(422).json({message: 'Missing field: username'});
    }

    let {username, password, stocks} = req.body;

    if (typeof username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }

    username = username.trim();

    if (username === '') {
        return res.status(422).json({message: 'Incorrect field length: username'});
    }

    if (!(password)) {
        return res.status(422).json({message: 'Missing field: password'});
    }

    if (typeof password !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: password'});
    }

    password = password.trim();

    if (password === '') {
        return res.status(422).json({message: 'Incorrect field length: password'});
    }

    // check for existing user
    return User.find({username}).count().exec().then(count => {
        if (count > 0) {
            console.log(count, 'USER DUPLICATE')
            return res.status(422).json({message: 'username already taken'});
        }
        // if no existing user, hash password
        return User.hashPassword(password)
    }).then(hash => {
        return User.create({username: username, password: hash, stocks: stocks})
    }).then(user => {
        // let loggedIn = true;
        // console.log('loggedIn:', loggedIn)

        return res.status(201).json(user.apiRepr());
    }).catch(err => {
        res.status(500).json({message: 'Internal server error'})
    });

});

//find user by username
router.get('/:username', passport.authenticate('local', {session: false}), (req, res) => {
    //   console.log(req.user)
    if (req.params.username !== req.user.username) {
        return res.status(404).json({message: 'not your user'})
    } else {
        res.json({user: req.user.apiRepr()})
    }
});

//edit username by username
router.put('/:username', passport.authenticate('local', {session: false}), (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }

    if (!('username' in req.body)) {
        return res.status(422).json({message: 'Missing field: username'});
    }

    let {username} = req.body;

    if (typeof username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }

    username = username.trim();

    if (username === '') {
        return res.status(422).json({message: 'Incorrect field length: username'});
    }

    return User.find({username}).count().exec().then(count => {
        if (count > 0) {
            return res.status(422).json({message: 'username already taken'});
        } else {
            User.find({username: req.params.username}).exec().then(user => {
                User.findByIdAndUpdate(user[0]._id, {
                    $set: {
                        username: username
                    }
                }).exec().then(updatedUser => res.status(204).json(updatedUser.apiRepr())).catch(err => res.status(500).json({message: 'Something went wrong'}));
            })
        }
    })
});

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

// router.get('/stocksaver', passport.authenticate('local', {session: false}), (req, res) => {
//
// })

module.exports = {
    router
};
