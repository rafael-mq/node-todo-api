/* eslint-disable no-undef */
const expect = require('expect')
const request = require('supertest')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/user')

const dummyTodos = [{
  text: 'Fisrt dummy todo'
}, {
  text: 'Second dummy todo'
}]

beforeEach(done => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(dummyTodos)
  }).then(() => done())
})

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Some todo text'

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({ text }).then(todos => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch(e => done(e))
      })
  })

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err) }
        Todo.find().then(todos => {
          expect(todos.length).toBe(2)
          done()
        }).catch(e => done(e))
      })
  })
})

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /user/:id', () => {
  let email = 'dummy_user@dummy.com'
  let id = ''

  before(done => {
    User.create({ email })
      .then(() => {
        return User.findOne({ email })
      })
      .then(doc => {
        id = String(doc._id)
        done()
      })
  })

  it('should get dummy user', done => {
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body['_id']).toBe(id)
      })
      .end(done)
  })

  it('should not get wrong user', done => {
    request(app)
      .get(`/todos/${id + 1}`)
      .expect(404)
      .end(done)
  })

  after(done => {
    User.findOneAndDelete({ email })
      .then(() => done())
  })
})
