const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Incident type is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  location: {
    type: String,
    trim: true
  },
  datetime: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedByName: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  evidence: {
    type: Object,
    default: null
  },
  lat: { type: Number },
  lng: { type: Number },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

incidentSchema.index({ reportedBy: 1, createdAt: -1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ type: 1 });

module.exports = mongoose.model('Incident', incidentSchema);