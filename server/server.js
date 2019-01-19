require('./config/config')
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

// eslint-disable-next-line no-unused-vars
const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

const port = process.env.PORT
let app = express()

// Midleware to parse request body
app.use(bodyParser.json())

// POST method to route '/todos' to add a todo
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  })

  todo.save().then(doc => {
    res.send(doc)
  }, err => {
    res.status(400).send(err)
  })
})

// GET method to route '/todos' to get all todos
app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => {
      res.send({ todos })
    })
    .catch(e => {
      res.status(400).send(e)
    })
})

// GET method to retrieve a todo by its ID
app.get('/todos/:id', (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    res.status(400).json({ error: 'Invalid ID' })
  } else {
    Todo.findById(id).then(doc => {
      if (!doc) {
        res.status(404).json({ error: 'Couldn\'t find todo' })
      } else {
        res.json({ todo: doc })
      }
    }).catch(e => console.log(e))
  }
})

// DELETE method to remove a todo from db by its ID
app.delete('/todos/:id', (req, res) => {
  let id = req.params.id

  if (!ObjectID.isValid(id)) {
    res.status(400).json({ error: 'Invalid ID' })
  } else {
    Todo.findByIdAndRemove(id).then(doc => {
      if (!doc) {
        res.status(404).json({ error: 'Couldn\'t find todo' })
      } else {
        res.json({ removed: doc })
      }
    }).catch(e => console.log(e))
  }
})

// PATCH method to update a todo by its ID
app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, { $set: todo }, { new: true })
      .then(doc => {
        if (!doc) {
          res.status(404).json({ error: 'Couldn\'t find todo' })
        } else {
          res.json({ updated: doc })
        }
      })
      .catch(e => {
        console.log(e)
        res.status(400).json({ error: 'Bad Request' })
      })
  }
})

// POST method to input new user
app.post('/users', (req, res) => {
  let { email, password } = req.body
  let user = new User({
    email,
    password
  })

  user.save()
    .then(() => {
      return user.generateAuthToken()
    })
    .then((token) => {
      // console.log('Headed token: ', token)
      res.header('x-auth', token).send(user)
    })
    .catch(e => res.status(404).send(e))
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`)
})

module.exports = { app }
