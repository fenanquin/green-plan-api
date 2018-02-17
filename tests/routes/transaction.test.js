const request = require('supertest');
const app = require('../../app');
const transactions = require('../fixtures/transactions');
const Transaction = require('../../models/transaction');
const User = require('../../models/user');
const mongoose = require('mongoose');

let token;
beforeAll((done) => {
  User.create({_id: transactions[0].user, email: 'a@a.com'}).then((user) => {
    token = user.generateToken();
    done();
  })
});

afterAll((done) => {
  User.remove({}).then(() => done());
})

beforeEach((done) => {
  Transaction.create(transactions).then(() => done());
});

afterEach((done) => {
  Transaction.remove({}).then(() => done());
});

test('should create a new transaction', () => {
  return request(app)
    .post('/transactions')
    .set('x-auth', token)
    .send({...transactions[0]})
    .expect(200)
    .then(response => {
      expect (response.body.id).toEqual(expect.any(String));
      expect(response.body).toEqual({...transactions[0], id: expect.any(String), date: transactions[0].date.toJSON(), user: transactions[0].user.toString()});

      return Transaction.findById(response.body.id).then((t) => {
        expect(t).toEqual(expect.objectContaining(transactions[0]));
      });
    });
});

test('should not create a transaction with invalid data', () => {
  let reqBody = {...transactions[0]};
  delete reqBody.amount;

  return request(app)
    .post('/transactions')
    .set('x-auth', token)
    .send(reqBody)
    .expect(400)
    .then(response => {
      expect(response.body).toEqual({message:'invalid'});
    });
});

test('should ignores id field on request when creating a new transaction', () => {
  return request(app)
    .post('/transactions')
    .set('x-auth', token)
    .send({...transactions[0], _id: transactions[0].user})
    .expect(200)
    .then(response => {
      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.id).not.toBe(transactions[0].user.toString());
    })
});

test('should respond with 401 status when no token is passed on post /transactions', () => {
  return request(app)
    .post('/transactions')
    .expect(401)
});

test('should get transactions of current year and month', () => {
  return request(app)
    .get('/transactions')
    .set('x-auth', token)
    .expect(200)
    .then(response => {
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({...transactions[0], id: expect.any(String), date: transactions[0].date.toJSON(), user: transactions[0].user.toString()});
      expect(response.body[1]).toEqual({...transactions[1], id: expect.any(String), date: transactions[1].date.toJSON(), user: transactions[1].user.toString()});
    });
});

test('should get transactions of given year and month', () => {
  return request(app)
    .get('/transactions?month=1&year=1970')
    .set('x-auth', token)
    .expect(200)
    .then(response => {
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual({...transactions[2], id: expect.any(String), date: transactions[2].date.toJSON(), user: transactions[2].user.toString()});
    });
});

test('should only get transactions of the given user', async () => {
  let newUser = await User.create({email:'b@b.com'});
  await newUser.save();
  let t = await Transaction.findOne({user: transactions[0].user});
  t.user = newUser._id;
  await t.save();
  return request(app)
    .get('/transactions')
    .set('x-auth', token)
    .expect(200)
    .then(response => {
      expect(response.body).toHaveLength(1);
      expect(response.body[0].user).not.toEqual(newUser._id.toString());
      expect(response.body[0]._id).not.toEqual(t._id.toString());
    });
});

test('should get transaction of given user and id', async () => {
  let t = await Transaction.findOne({description: transactions[0].description});
  return request(app)
    .get(`/transactions/${t._id.toString()}`)
    .set('x-auth', token)
    .expect(200)
    .then(response => {
      expect(response.body).toEqual({...transactions[0], id: expect.any(String), date: transactions[0].date.toJSON(), user: transactions[0].user.toString()});
    });
});

test('should respond with 404 status when no persisted transactions have the given id', async () => {
  return request(app)
    .get(`/transactions/${transactions[0].user.toString()}`)
    .set('x-auth', token)
    .expect(404);
});

test('should respond with 401 status when no token is passed on get /transactions', () => {
  return request(app)
    .get('/transactions')
    .expect(401)
});
