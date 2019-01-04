const express = require('express')
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

let app = express()

// Midleware to parse request body
app.use(bodyParser.json())

// POST method to routo '/todos' to add a todo
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

app.listen(3000, () => {
  console.log(`Server listening on port 3000...`)
})

module.exports = { app }
