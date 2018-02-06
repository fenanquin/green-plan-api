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

TransactionSchema.statics.findByMonth = function() {
  let startOf = new Date(moment.utc().startOf('month').format());
  let endOf = new Date(moment.utc().endOf('month').format());
  return this.find({date: {$gte: startOf, $lte: endOf}}).exec();
}

module.exports = mongoose.model('Transaction', TransactionSchema);
