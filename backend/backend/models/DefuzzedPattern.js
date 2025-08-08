// backend/models/DefuzzedPattern.js

import mongoose from 'mongoose';

const DefuzzedPatternSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sourceUrl: { type: String, required: true }, // changed from 'source' for clarity
  yarn: { type: String, default: 'Not specified' },
  hookSize: { type: String, default: 'Not specified' },
  language: { type: String, default: 'Unknown' },
  instructions: { type: String, default: '' },
  assembly: { type: String, default: '' },
  formatted: { type: String, required: true },
  categorized: { type: Object, default: {} },
  images: { type: [Object], default: [] },
  patternNumber: { type: String, default: 'Unknown' },
  gauge: { type: String, default: 'Not specified' },
  sizes: { type: String, default: 'Not specified' },
  difficulty: { type: String, default: 'Not specified' },
  yarnRequirements: { type: [String], default: [] },
  languages: { type: [Object], default: [] },
  relatedPatterns: { type: [Object], default: [] },
  scrapedAt: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date }, // could add if you ever want to track edits
});

export default mongoose.model('DefuzzedPattern', DefuzzedPatternSchema);
