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
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
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

TransactionSchema.statics.findByMonthAndYear = function(user, month, year) {
  let date = month && year ? moment.utc([year, month-1, 1]) : moment.utc();
  let startOf = new Date(date.startOf('month').format());
  let endOf = new Date(date.endOf('month').format());
  return this.find({date: {$gte: startOf, $lte: endOf}, user}).exec();
}

TransactionSchema.statics.createRecurring = function (transaction, until) {
  let begin = moment.utc(transaction.date).startOf('day');
  let end = moment.utc(until).startOf('day');
  let diff = end.diff(begin, 'months');
  transaction.date = new Date(begin);
  let recurring = [new Transaction(transaction)];

  if (diff > 0) {
    for (var i = 1; i <= diff; i++) {
      transaction.date = new Date(moment.utc(transaction.date).startOf('day').add(1, 'month').format());
      recurring.push(new Transaction(transaction));
    }
  }

  return recurring;
}

TransactionSchema.statics.findBy = function(user, id) {
  return this.findOne({_id: id, user}).exec();
}

TransactionSchema.statics.modify = async function(query, newData) {
  let transaction = await Transaction.findBy(query.user, query.id);
  if (transaction && !newData.user) {
    return transaction.update({$set: newData});
  } else {
    return Promise.reject();
  }
}

TransactionSchema.statics.delete = async function(user, id) {
  let transaction = await Transaction.findBy(user, id);
  if (transaction) {
    return transaction.remove();
  } else {
    return Promise.reject();
  }
}

TransactionSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
