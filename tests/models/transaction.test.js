const Transaction = require('../../models/transaction');
const transactions = require('../fixtures/transactions');

let t;
let validTransaction;

beforeEach(() => {
  validTransaction = {
    amount: 0,
    date: new Date(),
    description: ''
  };
  t = new Transaction(validTransaction);
});

beforeEach((done) => {
  Transaction.create(transactions).then(() => done());
});

afterEach((done) => {
  Transaction.remove({}).then(() => done());
});

test('should rejects transaction without amount field', () => {
  delete validTransaction.amount;
  t = new Transaction(validTransaction);
  return expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with amount equal to undefined or null', async () => {
  t.amount = undefined;
  await expect(t.validate()).rejects.toBeTruthy();

  t.amount = null;
  await expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with amount other than a number', () => {
  t.amount = false;
  expect(t.amount).toBe(validTransaction.amount);

  t.amount = '0.05';
  expect(typeof t.amount).toBe('number');
});

test('should rejects transaction without date field', () => {
  delete validTransaction.date;
  t = new Transaction(validTransaction);
  return expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with date equal to undefined or null', async () => {
  t.date = undefined;
  await expect(t.validate()).rejects.toBeTruthy();

  t.date = null;
  await expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects transactions with date field other than date', () => {
  t.date = false;
  expect(t.date).toBe(validTransaction.date);

  t.date = 0;
  expect(t.date instanceof Date).toBe(true);
});

test('should rejects transactions without description field', () => {
  delete validTransaction.description;
  t = new Transaction(validTransaction);
  return expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects transaction with description equal to undefined or null', async () => {
  t.description = undefined;
  await expect(t.validate()).rejects.toBeTruthy();

  t.description = null;
  await expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects transactions with description field other than string', () => {
  t.description = false;
  expect(typeof t.description).toBe('string');

  t.description = 0;
  expect(typeof t.description).toBe('string');
});

test('should find transactions by current month', async () => {
  debugger;
  let transactions = await Transaction.findByMonth();
  return expect(transactions).toHaveLength(3);
});
