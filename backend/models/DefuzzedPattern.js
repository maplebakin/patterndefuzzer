// backend/models/DefuzzedPattern.js
import mongoose from 'mongoose';

const DefuzzedPatternSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  yarn: String,
  hookSize: String,
  formatted: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('DefuzzedPattern', DefuzzedPatternSchema);
