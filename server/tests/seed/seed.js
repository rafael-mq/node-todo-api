const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todo } = require('./../../models/todo')
const { User } = require('./../../models/user')
const id1 = new ObjectID()
const id2 = new ObjectID()

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const dummyTodos = [{
  text: 'Fisrt dummy todo',
  _id: id1,
  _creator: userOneId
}, {
  text: 'Second dummy todo',
  _id: id2,
  _creator: userTwoId
}]

const laura = {
  _id: userTwoId,
  email: 'laura@node.com',
  password: 'userTwoPass',
  tokens: []
}
const rafa = {
  _id: userOneId,
  email: 'rafael@node.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
  }]
}
const dummyUsers = [rafa, laura]

const populateTodos = () => Todo.deleteMany({}).then(() => Todo.insertMany(dummyTodos))

// Function to be executed before /users tests
const populateUsers = () => {
  return User.deleteMany({})
    .then(() => {
      // These must be saved separetely because middleware isn't run on
      // buck save.
      var userOne = new User(dummyUsers[0]).save()
      var userTwo = new User(dummyUsers[1]).save()
      // Promise.all settles only after all of its promises settle
      return Promise.all([userOne, userTwo])
    })
}

module.exports = {
  id1,
  dummyTodos,
  populateTodos,
  dummyUsers,
  populateUsers
}
