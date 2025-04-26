const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const holidaySchema = new Schema({
  date: { type: Date, required: true, unique: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['national', 'religieux', 'autre'], required: true },
}, {
  timestamps: true
});

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
