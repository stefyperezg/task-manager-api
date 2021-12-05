const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task =  require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password must not contain "password"')
            }
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value)  {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps:true
})

//property from mongoose to establish a virtual relationship of a user to its tasks
userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject =  user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken  = async function() {
    const user = this
    const token = jwt.sign({_id:user.id.toString()},process.env.JWT_SECRET)
    user.tokens  = user.tokens.concat({token})
    await user.save()
    return  token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if (!user) {
        throw new Error('User not found')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Invalid Password")
    }
    return user
}


//USING MIDDLEWARE TO HASH PASSWORD BEFORE USERS ARE CREATED OR UPDATED
//this gives access to the individual user that is to be saved
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//DELETE USER TASKS WHEN USER IS REMOVED
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

//USE NPM VALIDATOR TO VALIDATE INPUT DATA
const User = mongoose.model('User', userSchema)

module.exports = User






//creating a new user
// const me = new User({
//     name: '     Stefanny    ',
//     email:'mYEMAIL@gMAIL.Com'
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })


