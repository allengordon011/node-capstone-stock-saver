const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');

const {User} = require('./models');

const router = express.Router();

router.use(jsonParser);

const basicStrategy = new BasicStrategy(function(username, password, callback) {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});


passport.use(basicStrategy);
router.use(passport.initialize());

//user creation
router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, password, stox} = req.body;

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
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash,
          stox: stox
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error'})
    });
});

//find user by username
router.get('/:username',
  passport.authenticate('basic', {session: false}),
  (req, res) => {
    //   console.log(req.user)
      if(req.params.username !== req.user.username) {
          return res.status(404).json({message: 'not your user'})
      } else {
      res.json({user: req.user.apiRepr()})
  }
});

//edit username by username
router.put('/:username', passport.authenticate('basic', {session: false}), (req, res) => {
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

    return User
      .find({username})
      .count()
      .exec()
      .then(count => {
        if (count > 0) {
          return res.status(422).json({message: 'username already taken'});
      } else {
         User.find({username: req.params.username})
         .exec()
         .then(user => {
             User.findByIdAndUpdate(user[0]._id, {$set: {username: username}})
             .exec()
             .then(updatedUser => res.status(204).json(updatedUser.apiRepr()))
             .catch(err => res.status(500).json({message: 'Something went wrong'}));
        })
      }
      })
});

//edit password by username
//     router.put('/:username/:password', passport.authenticate('basic', {session: false}), (req, res) => {
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
    router.delete('/:username', passport.authenticate('basic', {session: false}), (req, res) => {
        if(req.params.username !== req.user.username) {
            return res.status(404).json({message: 'not your user'})
        } else {
        return User.find({username: req.params.username})
        .exec()
        .then(user => {
            // console.log(user)
            User.findByIdAndRemove(user[0]._id)
            .exec()
            .then(() => {
              console.log(`Deleted user ${req.params.username}`);
              res.status(204).end();
          })
        })
    }
    })

    router.get('/:username/stox', (req, res) => {
        return User.find({username: req.params.username})
        .exec()
        .then(user => {
            User.findById(user[0]._id)
            .exec()
            .then(() => {
                res.status(200).json(user[0].stox)
            })
        })
    })

module.exports = {router};
