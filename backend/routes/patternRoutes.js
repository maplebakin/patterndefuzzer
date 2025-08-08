import express from 'express';
import patternController from '../controllers/patternController.js';

const router = express.Router();

function allowlistedDomain(req, res, next) {
  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'No URL provided.',
      });
    }

    const u = new URL(url);
    const hostname = u.hostname;

    const ALLOWED_HOSTS = new Set(['garnstudio.com', 'www.garnstudio.com']);
    if (!ALLOWED_HOSTS.has(hostname)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported domain: ${hostname}.`,
      });
    }

    // Garnstudio requires a specific pattern id in the URL
    if (hostname.includes('garnstudio.com')) {
      const hasId = u.pathname.includes('pattern.php') && u.searchParams.has('id');
      if (!hasId) {
        return res.status(400).json({
          success: false,
          message:
            'Please paste the full pattern URL, e.g. https://www.garnstudio.com/pattern.php?id=12345',
        });
      }
    }

    return next();
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid URL format.',
    });
  }
}

router.post('/scrape', allowlistedDomain, patternController.scrapeSingle);

export default router;
