const videoService = require('../services/videoService');
const youtubeUtils = require('../utils/youtubeUtils');

/**
 * Process a YouTube video URL and generate a summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processVideo(req, res) {
  try {
    const { videoUrl, settings } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({
        error: {
          code: 'MISSING_URL',
          message: 'YouTube URL is required'
        }
      });
    }
    
    const result = await videoService.processVideo(videoUrl, settings);
    res.status(202).json(result);
  } catch (error) {
    console.error('Error in processVideo controller:', error);
    
    // Determine appropriate error code and message
    let statusCode = 500;
    let errorCode = 'PROCESSING_ERROR';
    let errorMessage = 'An error occurred while processing the video';
    
    if (error.message.includes('Invalid YouTube URL')) {
      statusCode = 400;
      errorCode = 'INVALID_URL';
      errorMessage = 'Invalid YouTube URL provided';
    } else if (error.message.includes('Video not found')) {
      statusCode = 404;
      errorCode = 'VIDEO_NOT_FOUND';
      errorMessage = 'Video not found or not accessible';
    }
    
    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: errorMessage,
        details: error.message
      }
    });
  }
}

/**
 * Get the status of a video processing request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function getRequestStatus(req, res) {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUEST_ID',
          message: 'Request ID is required'
        }
      });
    }
    
    const status = videoService.getRequestStatus(requestId);
    
    if (!status) {
      return res.status(404).json({
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Processing request not found'
        }
      });
    }
    
    res.status(200).json(status);
  } catch (error) {
    console.error('Error in getRequestStatus controller:', error);
    res.status(500).json({
      error: {
        code: 'STATUS_ERROR',
        message: 'An error occurred while fetching request status',
        details: error.message
      }
    });
  }
}

/**
 * Get a summary by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function getSummary(req, res) {
  try {
    const { summaryId } = req.params;
    
    if (!summaryId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SUMMARY_ID',
          message: 'Summary ID is required'
        }
      });
    }
    
    const summary = videoService.getSummary(summaryId);
    
    if (!summary) {
      return res.status(404).json({
        error: {
          code: 'SUMMARY_NOT_FOUND',
          message: 'Summary not found'
        }
      });
    }
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error in getSummary controller:', error);
    res.status(500).json({
      error: {
        code: 'SUMMARY_ERROR',
        message: 'An error occurred while fetching summary',
        details: error.message
      }
    });
  }
}

/**
 * Regenerate a summary with new settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function regenerateSummary(req, res) {
  try {
    const { summaryId } = req.params;
    const { settings } = req.body;
    
    if (!summaryId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SUMMARY_ID',
          message: 'Summary ID is required'
        }
      });
    }
    
    if (!settings) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SETTINGS',
          message: 'Settings are required for regeneration'
        }
      });
    }
    
    const result = await videoService.regenerateSummary(summaryId, settings);
    res.status(202).json(result);
  } catch (error) {
    console.error('Error in regenerateSummary controller:', error);
    
    let statusCode = 500;
    let errorCode = 'REGENERATION_ERROR';
    let errorMessage = 'An error occurred while regenerating the summary';
    
    if (error.message.includes('Summary not found')) {
      statusCode = 404;
      errorCode = 'SUMMARY_NOT_FOUND';
      errorMessage = 'Summary not found';
    }
    
    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: errorMessage,
        details: error.message
      }
    });
  }
}

/**
 * Validate a YouTube URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function validateUrl(req, res) {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: {
          code: 'MISSING_URL',
          message: 'YouTube URL is required'
        }
      });
    }
    
    const videoId = youtubeUtils.extractVideoId(url);
    
    if (!videoId) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid YouTube URL format'
      });
    }
    
    const isValid = await youtubeUtils.validateVideo(videoId);
    
    if (!isValid) {
      return res.status(200).json({
        valid: false,
        error: 'Video not found or not accessible'
      });
    }
    
    // Get basic metadata
    const metadata = await youtubeUtils.getVideoMetadata(videoId);
    
    res.status(200).json({
      valid: true,
      videoId,
      metadata: {
        title: metadata.title,
        channel: metadata.channel,
        duration: metadata.duration,
        thumbnailUrl: metadata.thumbnailUrl
      }
    });
  } catch (error) {
    console.error('Error in validateUrl controller:', error);
    res.status(500).json({
      valid: false,
      error: 'An error occurred while validating the URL',
      details: error.message
    });
  }
}

module.exports = {
  processVideo,
  getRequestStatus,
  getSummary,
  regenerateSummary,
  validateUrl
};