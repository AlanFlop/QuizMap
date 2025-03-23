const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  name_fr: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  name_alternatives: {
    type: [String],
    default: []
  },
  continent: {
    type: String,
    required: true
  },
  capital: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: false
  }
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;