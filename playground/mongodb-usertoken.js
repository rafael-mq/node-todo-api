// const { ObjectID } = require('mongodb')
const { User } = require('./../server/models/user')
const jwt = require('jsonwebtoken')

let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzQ1ZmNlYmI1ODY5NzMyYzQwMWNiYzEiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTQ4MDkwNjAzfQ.EUym4kGkaJvWLqH3dMPLvSa8E3X0LZ6tw9QWJ_sjEwc'

console.log(jwt.verify(token, 'caju123')._id)
User.findOne({
  '_id': jwt.verify(token, 'caju123')._id,
  'tokens.token': token,
  'tokens.access': 'auth'
}, (err, user) => {
  console.log(err)
  console.log(user.email)
})
