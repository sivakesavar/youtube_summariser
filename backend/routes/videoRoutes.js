const express = require('express');
const videoController = require('../controllers/videoController');
const router = express.Router();

// Process a YouTube video URL
router.post('/videos/process', videoController.processVideo);

// Get the status of a video processing request
router.get('/videos/status/:requestId', videoController.getRequestStatus);

// Get a summary by ID
router.get('/summaries/:summaryId', videoController.getSummary);

// Regenerate a summary with new settings
router.put('/summaries/:summaryId/regenerate', videoController.regenerateSummary);

// Validate a YouTube URL
router.get('/videos/validate', videoController.validateUrl);

module.exports = router;