const { ObjectID } = require('mongodb')

// const { mongoose } = require('./../server/db/mongoose')
const { Todo } = require('./../server/models/todo')

let id = '5c2fba30a3bfc51598b967cc'

if (!ObjectID.isValid(id)) {
  console.log('Id not valid')
}

Todo.findById(id)
  .then(todos => {
    if (!todos) {
      return console.log('Id not found')
    }
    return console.log('Todos', todos)
  }).catch(e => console.log(e))
