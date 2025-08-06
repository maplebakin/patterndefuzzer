import express from 'express';
import patternController from '../controllers/patternController.js';

const router = express.Router();

router.post('/scrape', patternController.scrapeSingle);

export default router;
