// backend/models/DefuzzedPattern.js

import mongoose from 'mongoose';

const DefuzzedPatternSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  yarn: {
    type: String,
    default: 'Not specified',
  },
  hookSize: {
    type: String,
    default: 'Not specified',
  },
  language: {
    type: String,
    default: 'Unknown',
  },
  instructions: {
    type: String,
    default: '',
  },
  assembly: {
    type: String,
    default: '',
  },
  formatted: {
    type: String,
    required: true,
  },
  categorized: {
    type: Object, // Ex: { setup: [], mainInstructions: [], assembly: [], notes: [] }
    default: {},
  },
  images: {
    type: [Object], // Ex: [{ url: String, alt: String }]
    default: [],
  },
  patternNumber: {
    type: String,
    default: 'Unknown',
  },
  gauge: {
    type: String,
    default: 'Not specified',
  },
  sizes: {
    type: String,
    default: 'Not specified',
  },
  difficulty: {
    type: String,
    default: 'Not specified',
  },
  yarnRequirements: {
    type: [String],
    default: [],
  },
  languages: {
    type: [Object], // [{ language: "English", url: "..." }]
    default: [],
  },
  relatedPatterns: {
    type: [Object],
    default: [],
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('DefuzzedPattern', DefuzzedPatternSchema);
