const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    stocks: [String]
});

UserSchema.methods.apiRepr = function() {
    return {
        username: this.username || '',
        stocks: this.stocks || []
    };
}

UserSchema.methods.isValidPassword = function(password) {
    console.log('CHECKING PASSWORD')
    return bcrypt.compare(password, this.password);
        // function(err, matches) {
        // if (err) {
        //     console.log('Error while checking password');
        // } else if (matches) {
        //     console.log('The password matches!');
        // } else {
        //     console.log('The password does NOT match!');
        // }
    };

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);

module.exports = {
    User
}
