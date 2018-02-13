const express = require('express');
const bodyParser = require('body-parser');
const Transaction = require('./models/transaction');
const User = require('./models/user');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const authenticate = (req, res, next) => {
  let token = req.header('x-auth');
  User.verify(token).then((user) => {
    req.user = user;
    next();
  }, (e) => res.status(401).send());
}

app.post('/transactions', authenticate, async (req, res) => {
  try {
    let body = {
      amount: req.body.amount,
      date: req.body.date,
      description: req.body.description,
      user: req.user._id
    }
    let transaction = new Transaction(body);
    let t = await transaction.save();
    res.json(t);
  } catch (e) {
    res.status(400).json({message: 'invalid'});
  }
});

app.get('/transactions', authenticate, async (req, res) => {
  try {
    let {month, year} = req.query;
    let transactions = await Transaction.findByMonthAndYear(req.user._id, month, year);
    res.json(transactions);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.listen(4000, () => {
  console.log(`App running.`);
});

module.exports = app;
