const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: props => `${props.value} is not an email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

// Instance method to avoid allowing sensitive info to be sent to client
UserSchema.methods.toJSON = function () {
  let user = this.toObject()
  let { _id, email } = user

  return { _id, email }
}

// Instance method to generate and store auth token for a new user
UserSchema.methods.generateAuthToken = function () {
  var user = this
  var access = 'auth'
  var token = jwt.sign({ _id: user._id.toHexString(), access }, 'caju123').toString()

  // console.log('Created token: ', token)
  user.tokens.push({ token, access })

  // user.save returns a promise so we return it to promise-chain it afterwards
  return user.save()
    .then(() => {
      return token
    })
}

// Class method to query a user from db by its token
UserSchema.statics.findByToken = function (token) {
  // Return query promise
  let User = this
  // eslint-disable-next-line no-unused-vars
  let decoded

  try {
    decoded = jwt.verify(token, 'caju123')
  } catch (error) {
    return Promise.reject(error)
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.pre('save', function (next) {
  let user = this

  if (user.isModified('password')) {
    bcrypt.genSalt(10)
      .then(salt => {
        return bcrypt.hash(user.password, salt)
      })
      .then(hash => {
        user.password = hash
      })
      .catch(e => console.log(e))
  }

  next()
})

var User = mongoose.model('User', UserSchema)

module.exports = { User }
