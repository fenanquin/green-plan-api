const User = require('../../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

beforeEach((done) => {
  User.create({email:'a@a.com'}).then(() => done());
});

afterEach((done) => {
  User.remove({}).then(() => done());
});

test('should rejects user without email', () => {
  let user = new User({});
  return expect(user.validate()).rejects.toBeTruthy();
});

test('should rejects user with email equal to null, undefined or empty string', async () => {
  let user = new User({email: null});
  await expect(user.validate()).rejects.toBeTruthy();

  user.email = undefined;
  await expect(user.validate()).rejects.toBeTruthy();

  user.email = '';
  await expect(user.validate()).rejects.toBeTruthy();
});

test('should rejects user with invalid email pattern', () => {
  let user = new User({email:'invalid_email'});
  return expect(user.validate()).rejects.toBeTruthy();
});

test('should accepts user with valid email', () => {
  let user = new User({email: 'a@a.com'});
  return expect(user.validate()).resolves.toBeUndefined();
});

test('should find a user by email', async () => {
  let user = await User.findByEmail('a@a.com');
  return expect(user.email).toBe('a@a.com');
});

test('should generate a jwt token for given user with id and expiration date', async () => {
  let user = await User.findByEmail('a@a.com');
  let token = user.generateToken();
  let decoded = jwt.decode(token);
  expect(decoded.id).toEqual(expect.any(String));

  let OneDayInSeconds = 24 * 60 * 60;
  let nowInSeconds = Math.floor(Date.now() / 1000);
  expect(decoded.exp).toBeGreaterThanOrEqual(nowInSeconds + (7 * OneDayInSeconds));
  expect(decoded.exp).toBeLessThanOrEqual(nowInSeconds + (8 * OneDayInSeconds));
});

test('should rejects an invalid token', () => {
  return expect(User.verify('invalidToken')).rejects.toBeTruthy();
});

test('should return correct user if token for a valid token', async () => {
  let user = await User.findByEmail('a@a.com');
  user = await User.verify(user.generateToken());
  expect(user.email).toBe('a@a.com');
});
