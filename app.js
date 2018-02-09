const express = require('express');
const bodyParser = require('body-parser');
const Transaction = require('./models/transaction');

const app = express();

app.use(bodyParser.json());

app.post('/transactions', async (req, res) => {
  try {
    let transaction = new Transaction(req.body);
    let t = await transaction.save();
    res.json(t);
  } catch (e) {
    res.status(400).json({message: 'invalid'});
  }
});

module.exports = app;
