/* eslint-disable no-undef */
const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('./../server')
const { Todo } = require('./../models/todo')

const id1 = '5c338876ac29761e705e8d10'
const id2 = '5c338876ac29761e705e8d11'
const wrongId = '5c338876ac29761e705e8d09'

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

  it('should not get todo for unexisting id with 404 status', done => {
    request(app)
      .get(`/todos/${wrongId}`)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todo/:id', () => {
  let idDelete = new ObjectID()
  let anotherDummy = new Todo({
    text: 'a todo to be deleted',
    _id: idDelete
  })

  before('create a todo to be deleted', done => {
    anotherDummy.save()
      .then(() => done(), e => done(e))
      .catch(e => done(e))
  })

  it('should remove dummy todo', done => {
    request(app)
      .delete(`/todos/${idDelete.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.removed.text).toBe(anotherDummy.text)
      })
      .end(done)
  })

  it('should not find removed todo', done => {
    request(app)
      .get(`/todos/${idDelete.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should inform invalid id with 400 status', done => {
    let invalidId = idDelete + '1'
    request(app)
      .delete(`/todos/${invalidId}`)
      .expect(400)
      .expect(res => {
        expect(res.body.error).toBe('Invalid ID')
      })
      .end(done)
  })

  it('should not get todo for unexisting id with 404 status', done => {
    request(app)
      .delete(`/todos/${wrongId}`)
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  let idUpdate = new ObjectID()
  let updtDummy = new Todo({
    text: 'a todo which will be updated',
    _id: idUpdate
  })

  before('create a todo to be updated', done => {
    updtDummy.save()
      .then(() => done(), e => done(e))
      .catch(e => done(e))
  })

  it('should correctly update dummy todo', done => {
    request(app)
      .patch(`/todos/${idUpdate.toHexString()}`)
      .send({ todo: { text: 'an updated todo' } })
      .expect(200)
      .expect(res => {
        expect(res.body).not.toBe(null)
      })
      .end((err) => {
        if (err) { return done(err) }
        Todo.findOne({ text: 'an updated todo' })
          .then(todo => {
            expect(todo.text).toBe('an updated todo')
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should inform invalid id with 400 status', done => {
    let invalidId = idUpdate.toHexString() + '1'
    request(app)
      .patch(`/todos/${invalidId}`)
      .send({ todo: { text: 'an updated todo' } })
      .expect(400)
      .expect(res => {
        expect(res.body.error).toBe('Invalid ID')
      })
      .end(done)
  })

  it('should not get todo for unexisting id with 404 status', done => {
    request(app)
      .patch(`/todos/${wrongId}`)
      .send({ todo: { text: 'an updated todo' } })
      .expect(404)
      .end(done)
  })

  after('delete updated todo', done => {
    Todo.findByIdAndRemove(idUpdate)
      .then(() => done(), e => done(e))
      .catch(e => done(e))
  })
})
