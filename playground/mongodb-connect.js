// const MongoClient = require('mongodb').MongoClient
const { MongoClient, ObjectID } = require('mongodb')

// let obj = new ObjectID()

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
  if (err) { return console.log('Unable to connect to MongoDB server') }

  console.log('Connected to mongo')
  const db = client.db('TodoApp')

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('unable to insert data.')
  //   }
  //   console.log(JSON.stringify(res.ops, undefined, 2));
  // });

  // db.collection('Users').insertOne({
  //   name: 'Rafael Moreira Queiroz',
  //   age: 25,
  //   location: 'Rua Adelino Frutuoso 52 Recife'
  // }, (err, res) => {
  //   if (err) {
  //     return console.log('unable to insert data.')
  //   }
  //   console.log(JSON.stringify(res.ops, undefined, 2));
  // });

  // Fetching all data from db in array format as promise(THENABLE)
  // db.collection('Todos').find().toArray()
  //   .then(docs => {
  //     console.log('Todos')
  //     console.log(JSON.stringify(docs, undefined, 2))
  //   }, err => {
  //     console.log('Unable to fetch data')
  //   })

  // Fetching queried data from db in array format as promise(THENABLE)
  db.collection('Todos').find({ completed: true }).toArray()
    .then(docs => {
      console.log('Completed Todos')
      console.log(JSON.stringify(docs, undefined, 2))
    }, err => {
      console.log('Unable to fetch data', err)
    })

  client.close()
});