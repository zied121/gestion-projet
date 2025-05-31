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
    enum: ['standard', 'premium', 'premium_plus', 'custom'],
    default: 'standard'
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  
  // Custom plan fields
  userLimit: { 
    type: Number, 
    default: null 
  },
  projectLimit: { 
    type: Number, 
    default: null 
  },
  customFunctionalities: [{
    type: Schema.Types.ObjectId,
    ref: 'Functionality'
  }],
  customPrice: {
    type: Number,
    default: 0
  },
  
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
