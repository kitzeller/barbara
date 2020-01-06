var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    gender: String,
    address: String,
    sessions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Session'}]
});

// Before saving the user, hash the password
userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) {
                return next(error);
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

// Omit the password when returning a user
userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.password;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
