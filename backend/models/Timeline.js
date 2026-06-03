const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timeline', timelineSchema);