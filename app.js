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

app.get('/transactions/:id', authenticate, async (req, res) => {
  try {
    let transaction = await Transaction.findBy(req.user._id, req.params.id);
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).end();
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

app.put('/transactions/:id', authenticate, async (req, res) => {
  try {
    const query = {
      user: req.user._id,
      id: req.params.id
    };
    await Transaction.modify(query, req.body);
    res.status(200).send();
  } catch (e) {
    res.status(400).json({message: 'invalid'});
  }
});

app.delete('/transactions/:id', authenticate, async (req, res) => {
  try {
    await Transaction.delete(req.user._id, req.params.id);
    res.status(200).send();
  } catch (e) {
    res.status(400).json({message: 'invalid'});
  }
});

app.listen(4000, () => {
  console.log(`App running.`);
});

module.exports = app;
