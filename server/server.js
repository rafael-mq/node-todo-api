require('./config/config')
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

// eslint-disable-next-line no-unused-vars
const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate } = require('./middleware/authenticate')

const port = process.env.PORT
let app = express()

// Midleware to parse request body
app.use(bodyParser.json())

// POST method to route '/todos' to add a todo
app.post('/todos', authenticate, async (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })

  try {
    let doc = await todo.save()
    res.send(doc)
  } catch (e) {
    res.status(400).send(e)
  }
})

// GET method to route '/todos' to get all todos
app.get('/todos', authenticate, async (req, res) => {
  try {
    let todos = await Todo.find({ _creator: req.user._id })
    res.send({ todos })
  } catch (e) {
    res.status(400).send(e)
  }
})

// GET method to retrieve a todo by its ID
app.get('/todos/:id', authenticate, async (req, res) => {
  let id = req.params.id

  try {
    if (!ObjectID.isValid(id)) {
      throw Error('Invalid ID')
    }

    let doc = await Todo.findOne({
      _id: id,
      _creator: req.user._id
    })
    if (!doc) {
      throw Error('Couldn\'t find todo')
    }
    res.json({ todo: doc })
  } catch (e) {
    if (e.message === 'Invalid ID') {
      res.status(400).json({ error: 'Invalid ID' })
    } else if (e.message === 'Couldn\'t find todo') {
      res.status(404).json({ error: 'Couldn\'t find todo' })
    }
  }
})

// DELETE method to remove a todo from db by its ID
app.delete('/todos/:id', authenticate, async (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    res.status(400).json({ error: 'Invalid ID' })
  } else {
    try {
      let doc = await Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
      })

      if (!doc) {
        throw new Error('Couldn\'t find todo')
      } else {
        res.json({ removed: doc })
      }
    } catch (e) {
      res.status(404).json({ error: e.message })
    }
  }
})

// PATCH method to update a todo by its ID
app.patch('/todos/:id', authenticate, async (req, res) => {
  let id = req.params.id
  let todo = req.body.todo

  if (!ObjectID.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' })
  } else {
    // Set completedAt Date if completed has been set
    if (todo.hasOwnProperty('completed')) {
      if (todo.completed) {
        todo.completedAt = new Date().getTime()
      }
    } else {
      todo.completed = false
      todo.completedAt = null
    }

    let doc = await Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, { $set: todo }, { new: true })

    try {
      if (!doc) {
        res.status(404).json({ error: 'Couldn\'t find todo' })
      } else {
        res.json({ updated: doc })
      }
    } catch (e) {
      res.status(400).json({ error: 'Bad Request' })
    }
  }
})

// POST method to input new user
app.post('/users', async (req, res) => {
  let { email, password } = req.body
  let user = new User({
    email,
    password
  })

  try {
    await user.save()
    let token = await user.generateAuthToken()
    return res.header('x-auth', token).send(user.toJSON())
  } catch (e) { res.status(400).send(e) }
})

// GET method to get authenticated user by token sent in header x-auth
app.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user)
})

// POST method to login user by its email and password
app.post('/users/login', async (req, res) => {
  let { email, password } = req.body

  try {
    let user = await User.findByCredentials(email, password)
    let token = await user.generateAuthToken()
    res.header('x-auth', token).send(user.toJSON())
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
})

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token)
    res.status(200).send()
  } catch (e) {
    res.status(400).send(e)
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`)
})

module.exports = { app }
