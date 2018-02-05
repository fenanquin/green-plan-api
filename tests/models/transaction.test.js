const Transaction = require('../../models/transaction');

let t;
let validTransaction;

beforeEach(() => {
  validTransaction = {
    type: 'CREDIT',
    amount: 0
  };
  t = new Transaction(validTransaction);
});

test('should rejects doc without type field', () => {
  delete validTransaction.type;
  t = new Transaction(validTransaction);
  return expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects doc with type equal to undefined or null', async () => {
  t.type = undefined;
  await expect(t.validate()).rejects.toBeTruthy();

  t.type = null;
  await expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects doc with type value other than DEBIT or CREDIT', async () => {
  t.type = 0;
  await expect(t.validate()).rejects.toBeTruthy();

  t.type = 'OTHER';
  await expect(t.validate()).rejects.toBeTruthy();

  t.type = 'DEBIT';
  await expect(t.validate()).resolves.toBeUndefined();

  t.type = 'CREDIT';
  await expect(t.validate()).resolves.toBeUndefined();
});

test('should rejects doc without amount field', () => {
  delete validTransaction.amount;
  t = new Transaction(validTransaction);
  return expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects doc with amount equal to undefined or null', async () => {
  t.amount = undefined;
  await expect(t.validate()).rejects.toBeTruthy();

  t.amount = null;
  await expect(t.validate()).rejects.toBeTruthy();
});

test('should rejects doc with amount other than a number', () => {
  t.amount = false;
  expect(t.amount).toBe(validTransaction.amount);

  t.amount = '0.05';
  expect(typeof t.amount).toBe('number');
});
