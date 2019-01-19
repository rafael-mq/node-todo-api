const { User } = require('./../models/user')

// User Authentication Middleware
const authenticate = (req, res, next) => {
  let token = req.header('x-auth')

  User.findByToken(token)
    .then(user => {
      if (!user) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Token not found')
      }
      req.user = user
      req.token = token
      next()
    })
    .catch(e => res.status(401).send(e))
}

module.exports = {
  authenticate
}
