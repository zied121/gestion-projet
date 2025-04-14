const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  organisation: {
    type: Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  type: {
    type: String,
    enum: ['standard', 'premium', 'premium_plus'],
    default: 'standard'
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
