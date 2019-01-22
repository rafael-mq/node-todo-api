const { User } = require('./../models/user')

// User Authentication Middleware
const authenticate = (req, res, next) => {
  let token = req.header('x-auth')
  User.findByToken(token)
    .then(user => {
      // console.log('what i found', user)
      if (!user) {
        return Promise.reject(new Error('Token not found'))
      }
      req.user = user
      req.token = token
      next()
    })
    .catch(e => {
      res.status(401).send(e)
    })
}

module.exports = {
  authenticate
}
