const request = require('supertest');
const app = require('../../app');
const transactions = require('../fixtures/transactions');
const Transaction = require('../../models/transaction');

beforeEach((done) => {
  Transaction.create(transactions).then(() => done());
});

afterEach((done) => {
  Transaction.remove({}).then(() => done());
});

test('should create a new transaction', () => {
  return request(app)
    .post('/transactions')
    .send({...transactions[0]})
    .expect(200)
    .then(response => {
      expect (response.body._id).toEqual(expect.any(String));
      expect(response.body).toEqual({...transactions[0], _id: expect.any(String), date: transactions[0].date.toJSON()});

      return Transaction.findById(response.body._id).then((t) => {
        expect(t).toEqual(expect.objectContaining(transactions[0]));
      });
    });
});

test('should not create a transaction with invalid data', () => {
  let reqBody = {...transactions[0]};
  delete reqBody.amount;

  return request(app)
    .post('/transactions')
    .send(reqBody)
    .expect(400)
    .then(response => {
      expect(response.body).toEqual({message:'invalid'});
    });
});

test('should get transactions of current year and month', () => {
  return request(app)
    .get('/transactions')
    .expect(200)
    .then(response => {
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({...transactions[0], _id: expect.any(String), date: transactions[0].date.toJSON()});
      expect(response.body[1]).toEqual({...transactions[1], _id: expect.any(String), date: transactions[1].date.toJSON()});
    });
});

test('should get transactions of given year and month', () => {
  return request(app)
    .get('/transactions?month=1&year=1970')
    .expect(200)
    .then(response => {
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual({...transactions[2], _id: expect.any(String), date: transactions[2].date.toJSON()});
    });
});
