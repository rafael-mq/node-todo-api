/* eslint-disable handle-callback-err */
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
  var token = jwt.sign({ _id: user._id, access }, process.env.JWT_SECRET).toString()

  // TODO: avoid token reinsertion
  if (user.tokens.length < 1) {
    user.tokens.push({ token, access })
  }

  // user.save returns a promise so we return it to promise-chain it afterwards
  return user.save()
    .then(() => {
      return user.tokens[0].token
    })
}

// Instance method to remove passed token
UserSchema.methods.removeToken = function (token) {
  var user = this

  return user.updateOne({
    // this will remove array element
    $pull: {
      tokens: { token }
    }
  })
}

// Class method to query a user from db by its token
UserSchema.statics.findByToken = function (token) {
  // Return query promise
  let User = this
  // eslint-disable-next-line no-unused-vars
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return Promise.reject(error)
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

// Class method to query a user by email and check password informed
UserSchema.statics.findByCredentials = function (email, password) {
  let User = this

  return User.findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error('User not found'))
      }

      return bcrypt.compare(password, user.password)
        .then(check => {
          if (check) {
            return user
          } else {
            return Promise.reject(new Error('Incorrect Password'))
          }
        })
    })
}

// Middleware to hash passwords
UserSchema.pre('save', function (next) {
  // LOG: console.log('Pre save hook executed')
  let user = this

  if (user.isModified('password')) {
    // LOG: console.log('Is modified worked: ', user.password)
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

var User = mongoose.model('User', UserSchema)

module.exports = { User }
