/* eslint-disable no-undef */
const expect = require('expect')
const request = require('supertest')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const id1 = '5c338876ac29761e705e8d10'
const id2 = '5c338876ac29761e705e8d11'
const wrongId = '5c338876ac29761e705e8d12'

const dummyTodos = [{
  text: 'Fisrt dummy todo',
  _id: id1
}, {
  text: 'Second dummy todo',
  _id: id2
}]

describe('POST /todos', () => {
  beforeEach(done => {
    Todo.deleteMany({}).then(() => {
      return Todo.insertMany(dummyTodos)
    }).then(() => done())
  })

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
      .end((err) => {
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

describe('GET /todo/:id', () => {
  it('should get dummy todo', done => {
    request(app)
      .get(`/todos/${id1}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo).toBeDefined()
      })
      .end(done)
  })

  it('should inform invalid id with 400 status', done => {
    let invalidId = id1 + '1'
    request(app)
      .get(`/todos/${invalidId}`)
      .expect(400)
      .expect(res => {
        expect(res.body.error).toBe('Invalid ID')
      })
      .end(done)
  })

  it('should not get to for unexisting id with 404 status', done => {
    request(app)
      .get(`/todos/${wrongId}`)
      .expect(404)
      .end(done)
  })
})
