const ObjectId = require('mongoose').Types.ObjectId;

const user = new ObjectId();

const transactions = [
  {
    amount: 100,
    date: new Date(),
    description: 'Rent bill',
    user
  },
  {
    amount: 150,
    date: new Date(),
    description: 'Water bill',
    user
  },
  {
    amount: 200,
    date: new Date(0),
    description: 'Gas bill',
    user
  },
]

module.exports = transactions;
