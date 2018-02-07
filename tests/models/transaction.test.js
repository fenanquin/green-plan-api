const Transaction = require('../../models/transaction');
const transactions = require('../fixtures/transactions');
const moment = require('moment');

let transaction, transactionModel;
beforeEach(() => {
  transaction = {... transactions[0]};
  transactionModel = new Transaction(transactions[0]);
});

beforeEach((done) => {
  Transaction.create(transactions).then(() => done());
});

afterEach((done) => {
  Transaction.remove({}).then(() => done());
});

test('should rejects transaction without amount field', () => {
  delete transaction.amount;
  transactionModel = new Transaction(transaction);
  return expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with amount equal to undefined or null', async () => {
  transactionModel.amount = undefined;
  await expect(transactionModel.validate()).rejects.toBeTruthy();

  transactionModel.amount = null;
  await expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with amount other than a number', () => {
  transactionModel.amount = false;
  expect(typeof transactionModel.amount).toBe('number');

  transactionModel.amount = '0.05';
  expect(typeof transactionModel.amount).toBe('number');
});

test('should rejects transaction without date field', () => {
  delete transaction.date;
  transactionModel = new Transaction(transaction);
  return expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with date equal to undefined or null', async () => {
  transactionModel.date = undefined;
  await expect(transactionModel.validate()).rejects.toBeTruthy();

  transactionModel.date = null;
  await expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should rejects transactions with date field other than date', () => {
  transactionModel.date = false;
  expect(transactionModel.date).toBe(transaction.date);

  transactionModel.date = 0;
  expect(transactionModel.date instanceof Date).toBe(true);
});

test('should rejects transactions without description field', () => {
  delete transaction.description;
  transactionModel = new Transaction(transaction);
  return expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with description equal to undefined or null', async () => {
  transactionModel.description = undefined;
  await expect(transactionModel.validate()).rejects.toBeTruthy();

  transactionModel.description = null;
  await expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should rejects transactions with description field other than string', () => {
  transactionModel.description = false;
  expect(typeof transactionModel.description).toBe('string');

  transactionModel.description = 0;
  expect(typeof transactionModel.description).toBe('string');
});

test('should find transactions by current month and year', async () => {
  let transactions = await Transaction.findByMonthAndYear();
  return expect(transactions).toHaveLength(2);
});

test('should find transactions by given month and year', async () => {
  let transactions = await Transaction.findByMonthAndYear(1, 1970);
  return expect(transactions).toHaveLength(1);
});

test('should divide a transaction in many parts with equal amount', () => {
  let parts = transactionModel.divideInto(2);
  expect(parts).toHaveLength(2);
  expect(parts[0].amount).toBe(transaction.amount/2);
  expect(parts[1].amount).toBe(transaction.amount/2);
});

test('should divide a transaction in parts with proper description', () => {
  let parts = transactionModel.divideInto(2);
  expect(parts[0].description).toBe(transaction.description + ' 1/2');
  expect(parts[1].description).toBe(transaction.description + ' 2/2');
});

test('should divide a transaction in parts with different dates', () => {
  let parts = transactionModel.divideInto(2);
  expect(parts[0].date).toEqual(transaction.date);
  expect(parts[1].date).toEqual(new Date(moment.utc(transaction.date).add(1, 'month').format()));
});
