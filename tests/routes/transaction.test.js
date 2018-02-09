const request = require('supertest');
const app = require('../../app');
const transactions = require('../fixtures/transactions');
const Transaction = require('../../models/transaction');

test('should create a new transaction', () => {
  return request(app)
    .post('/transactions')
    .send({...transactions[0]})
    .expect(200)
    .then(response => {
      expect (response.body._id).toEqual(expect.any(String));

      let transaction = {...transactions[0]};
      transaction.date = transaction.date.toJSON();
      transaction._id = response.body._id;
      expect(response.body).toEqual(transaction);

      Transaction.findById(transaction._id).then((t) => {
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
