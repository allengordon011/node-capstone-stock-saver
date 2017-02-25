const LocalStrategy = require('passport-local').Strategy;
const {User} = require('../models/user');

//serialize/deserialize so that every subsequent request will not contain the user credentials
module.exports = function(passport) {
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
},
function(req, username, password, done) {
    //process.nextTick(function() {
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
};
