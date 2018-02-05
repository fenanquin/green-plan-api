const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['CREDIT', 'DEBIT']
  },
  amount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
