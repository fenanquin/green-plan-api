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

test('should rejects transactions without user field', () => {
  delete transaction.user;
  transactionModel = new Transaction(transaction);
  return expect(transactionModel.validate()).rejects.toBeTruthy();
});

test('should find transactions by current month and year', async () => {
  let retrivedData = await Transaction.findByMonthAndYear(transactions[0].user);
  return expect(retrivedData).toHaveLength(2);
});

test('should find transactions by given month and year', async () => {
  let retrivedData = await Transaction.findByMonthAndYear(transactions[0].user, 1, 1970);
  return expect(retrivedData).toHaveLength(1);
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


test('should create recurring transactions for the specified date interval', () => {
  let to = new Date(moment.utc(transaction.date).add(1, 'year').format());
  let recurringTransactions = Transaction.createRecurring({...transaction}, to);
  expect(recurringTransactions).toHaveLength(13);

  let initialDate = new Date(moment.utc(transaction.date).startOf('day').format());
  expect(recurringTransactions[0].date).toEqual(initialDate);

  let sixMonthesAfter = new Date(moment.utc(transaction.date).startOf('day').add(6, 'month').format());
  expect(recurringTransactions[6].date).toEqual(sixMonthesAfter);

  let oneYearAfter = new Date(moment.utc(transaction.date).startOf('day').add(12, 'month').format());
  expect(recurringTransactions[12].date).toEqual(oneYearAfter);
});

test('should create recurring transactions with same values except dates', () => {
  let until = new Date(moment.utc(transaction.date).add(1, 'month').format());
  let recurringTransactions = Transaction.createRecurring(transaction, until);
  expect(recurringTransactions).toHaveLength(2);

  let firstTransaction = recurringTransactions[0].toObject();
  delete firstTransaction._id;
  delete firstTransaction.date;

  let secondTransaction = recurringTransactions[1].toObject();
  delete secondTransaction._id;
  delete secondTransaction.date;

  expect(firstTransaction).toEqual(secondTransaction);
});

test('should create a recurring transaction with same values as original transaction', () => {
  let until = new Date(moment.utc(transaction.date).add(1, 'day').format());
  let recurringTransactions = Transaction.createRecurring(transaction, until);
  expect(recurringTransactions).toHaveLength(1);

  let oneTransaction = recurringTransactions[0].toObject();
  delete oneTransaction._id;
  expect(oneTransaction).toEqual(transaction);
});

test('should not find any transactions without passing user id', async () => {
  let oneTransaction = await Transaction.findOne();
  let foundTransaction = await Transaction.findBy(undefined, oneTransaction._id.toString());
  expect(foundTransaction).toBeNull();
});

test('should not find any transactions with object id that does not exist on database', async () => {
  let foundTransaction = await Transaction.findBy(transactions[0].user, transactions[0].user);
  expect(foundTransaction).toBeNull();
});

test('should find a transaction by existing id on database', async () => {
  let oneTransaction = await Transaction.findOne();
  let foundTransaction = await Transaction.findBy(oneTransaction.user.toString(), oneTransaction._id.toString());
  expect(foundTransaction).toBeTruthy();
});
