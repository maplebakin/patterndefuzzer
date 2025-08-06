// backend/routes/patternRoutes.js

const express = require('express');
const router = express.Router();
const patternController = require('../controllers/patternController');

// POST /api/patterns/scrape
router.post('/scrape', patternController.scrapeSingle);

// GET /api/patterns
router.get('/', patternController.getAllPatterns);

// GET /api/patterns/:id
router.get('/:id', patternController.getPatternById);

module.exports = router;
