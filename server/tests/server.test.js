// External dependencies imports
/* eslint-disable no-undef */
const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

// Internal dependencies imports
const { app } = require('./../server')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/user')
const { dummyTodos } = require('./seed/seed')
const { populateTodos } = require('./seed/seed')
const { dummyUsers } = require('./seed/seed')
const { populateUsers } = require('./seed/seed')

describe('********** TODOS tests **********', function () {
  const wrongId = '5c338876ac29761e705e8d09'
  this.timeout(10000)

  before(populateTodos)

  describe('POST /todos', () => {
    let text = 'Some todo text'

    it('should create a new todo', done => {
      request(app)
        .post('/todos')
        .send({ text })
        .expect(200)
        .expect(res => {
          expect(res.body.text).toBe(text)
        })
        .end(done)
    })

    it('should not create todo with invalid body data', done => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end(done)
    })

    after(done => {
      Todo.deleteOne({ text: 'Some todo text' }, e => {
        if (e) { return done(e) }
        done()
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
        .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(dummyTodos[0].text)
        })
        .end(done)
    })

    it('should inform invalid id with 400 status', done => {
      let invalidId = dummyTodos[0]._id.toHexString() + '1'
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
})

describe('********** USERS tests **********', function () {
  // this.timeout('5s')

  before('Preparing for users tests', populateUsers)

  describe('POST /users', () => {
    let email = 'postUser@node.com'
    let password = 'postUser'

    it('should create new user', done => {
      request(app)
        .post('/users')
        .send({ email, password })
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).toBeTruthy()
        })
        .expect(res => {
          expect(res.body.email).toBe(email)
        })
        .end(err => {
          if (err) {
            return done(err)
          }

          User.findOne({ email })
            .then(user => {
              expect(user.email).toBe(email)
              expect(user.password).not.toBe(password)
              done()
            })
            .catch(e => done(e))
        })
    })

    it('should not duplicate existing user', done => {
      request(app)
        .post('/users')
        .send({ email, password })
        .expect(400)
        .end(done)
    })

    it('should not create user with invalid data', done => {
      request(app)
        .post('/users')
        .send({ email: 'rafael', password: '1' })
        .expect(400)
        .end(done)
    })

    after('Delete postUser after testing', () => User.deleteOne({ email: email }))
  })

  describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
      request(app)
        .get('/users/me')
        .set('x-auth', dummyUsers[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toBe(dummyUsers[0].email)
        })
        .end(done)
    })

    it('should respond 401 for unauthenticated user', done => {
      request(app)
        .get('/users/me')
        .set('x-auth', dummyUsers[0].tokens[0].token.toString() + 1)
        .expect(401)
        .end(done)
    })
  })
})
