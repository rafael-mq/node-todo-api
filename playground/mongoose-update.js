// eslint-disable-next-line no-unused-vars
const { mongoose } = require('./../server/db/mongoose')
const { Todo } = require('./../server/models/todo')

console.log('Updating...')

Todo.findByIdAndUpdate('5c338876ac29761e705e8d13', {
  completed: false,
  text: 'Updated dummy'
})
  .then(doc => console.log(JSON.stringify(doc, undefined, 2)))
  .catch(e => console.log(e))
