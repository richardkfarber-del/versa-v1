
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Add any other partner-related fields here
});

module.exports = mongoose.model('Partner', partnerSchema);
