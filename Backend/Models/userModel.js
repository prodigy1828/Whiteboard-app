const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim : true,
        maxLenght: 50
    },
    email: {
        type: String,
        required: true,
        trim : true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'users'
});


userSchema.statics.register = async function (name, email, password) {
    try {
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }
        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 0,
            minUppercase: 0, 
            minNumbers: 0,
            minSymbols: 0 
        })) {
            throw new Error('Password is not strong enough');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new this({ name, email, password: hashedPassword });
        const new_user = await user.save();
        return new_user;
    } catch (error) {
        throw new Error('Error Registering user:' + error.message);
    }
}

userSchema.statics.getUser = async function (email) {
    try {
        const user = await this.findOne({email});
        return user;
    } catch (error) {
        throw new Error('Error getting user:'+error.message);
    }
}

userSchema.statics.login = async function (email, password) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        return user;
    } catch (error) {
        throw new Error('Error Logging in:' + error.message);
    }
}

//delete 

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;