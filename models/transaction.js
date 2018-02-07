const mongoose = require('../db/mongoose');
const moment = require('moment');

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

TransactionSchema.methods.divideInto = function (numberOfParts) {
  let transactions = [];
  let newAmount = this.amount / numberOfParts;
  for (let i = 0; i < numberOfParts; i++) {
    let t = new Transaction({
      amount: newAmount,
      date: i > 0 ? new Date(moment.utc(this.date).add(1, 'month').format()) : this.date,
      description: `${this.description} ${i + 1}/${numberOfParts}`
    });
    transactions.push(t);
  }

  return transactions;
}

TransactionSchema.statics.findByMonthAndYear = function(month, year) {
  let date = month && year ? moment.utc([year, month-1, 1]) : moment.utc();
  let startOf = new Date(date.startOf('month').format());
  let endOf = new Date(date.endOf('month').format());
  return this.find({date: {$gte: startOf, $lte: endOf}}).exec();
}

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
