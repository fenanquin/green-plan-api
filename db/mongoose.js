const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test');
mongoose.set('debug', true);

module.exports = mongoose;
