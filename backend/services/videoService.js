const { v4: uuidv4 } = require('uuid');
const youtubeUtils = require('../utils/youtubeUtils');
const llmService = require('./llmService');

// In-memory storage for processing requests and summaries
// In a production environment, this would be replaced with a database
const processingRequests = new Map();
const summaries = new Map();

/**
 * Process a YouTube video URL and generate a summary
 * @param {string} videoUrl - YouTube video URL
 * @param {Object} settings - Summary customization settings
 * @returns {Promise<Object>} - Processing request information
 */
async function processVideo(videoUrl, settings = {}) {
  try {
    // Extract video ID from URL
    const videoId = youtubeUtils.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Validate if video exists and is accessible
    const isValid = await youtubeUtils.validateVideo(videoId);
    if (!isValid) {
      throw new Error('Video not found or not accessible');
    }
    
    // Generate request ID
    const requestId = `proc_${uuidv4()}`;
    
    // Get video metadata
    const metadata = await youtubeUtils.getVideoMetadata(videoId);
    metadata.videoId = videoId;
    
    // Store request in processing queue
    processingRequests.set(requestId, {
      requestId,
      videoId,
      status: 'processing',
      progress: 0,
      settings,
      metadata,
      createdAt: new Date().toISOString()
    });
    
    // Process video asynchronously
    processVideoAsync(requestId, videoId, metadata, settings);
    
    // Return initial response
    return {
      requestId,
      status: 'processing',
      estimatedTime: estimateProcessingTime(metadata.duration),
      videoId,
      videoMetadata: {
        title: metadata.title,
        channel: metadata.channel,
        duration: formatDuration(metadata.duration),
        publishDate: metadata.publishDate,
        thumbnailUrl: metadata.thumbnailUrl
      }
    };
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}

/**
 * Process video asynchronously
 * @param {string} requestId - Request ID
 * @param {string} videoId - YouTube video ID
 * @param {Object} metadata - Video metadata
 * @param {Object} settings - Summary customization settings
 */
async function processVideoAsync(requestId, videoId, metadata, settings) {
  try {
    // Update progress
    updateRequestProgress(requestId, 10, 'Fetching transcript');
    
    // Get video transcript
    const transcript = await youtubeUtils.getVideoTranscript(videoId);
    
    // Update progress
    updateRequestProgress(requestId, 30, 'Processing transcript');
    
    // Format transcript for LLM
    const formattedTranscript = youtubeUtils.formatTranscriptForLLM(transcript);
    
    // Update progress
    updateRequestProgress(requestId, 50, 'Generating summary');
    
    // Generate summary using LLM
    const summary = await llmService.generateSummary({
      transcript: formattedTranscript,
      metadata,
      settings
    });
    
    // Update progress
    updateRequestProgress(requestId, 80, 'Finalizing summary');
    
    // Generate social media snippets
    const twitterSnippet = await llmService.generateSocialSnippet(summary, 'twitter');
    const linkedinSnippet = await llmService.generateSocialSnippet(summary, 'linkedin');
    
    // Add social snippets to summary
    summary.socialShareable = {
      twitter: twitterSnippet,
      linkedin: linkedinSnippet
    };
    
    // Generate summary ID
    const summaryId = `sum_${uuidv4()}`;
    
    // Store summary
    summaries.set(summaryId, summary);
    
    // Update request status to completed
    updateRequestStatus(requestId, 'completed', 100, summaryId);
  } catch (error) {
    console.error(`Error in async processing for request ${requestId}:`, error);
    updateRequestStatus(requestId, 'failed', 0, null, error.message);
  }
}

/**
 * Update request progress
 * @param {string} requestId - Request ID
 * @param {number} progress - Progress percentage
 * @param {string} statusMessage - Status message
 */
function updateRequestProgress(requestId, progress, statusMessage) {
  const request = processingRequests.get(requestId);
  if (request) {
    request.progress = progress;
    request.statusMessage = statusMessage;
    processingRequests.set(requestId, request);
  }
}

/**
 * Update request status
 * @param {string} requestId - Request ID
 * @param {string} status - Status (processing, completed, failed)
 * @param {number} progress - Progress percentage
 * @param {string} summaryId - Summary ID (if completed)
 * @param {string} errorMessage - Error message (if failed)
 */
function updateRequestStatus(requestId, status, progress, summaryId = null, errorMessage = null) {
  const request = processingRequests.get(requestId);
  if (request) {
    request.status = status;
    request.progress = progress;
    
    if (summaryId) {
      request.summaryId = summaryId;
    }
    
    if (errorMessage) {
      request.errorMessage = errorMessage;
    }
    
    request.updatedAt = new Date().toISOString();
    processingRequests.set(requestId, request);
  }
}

/**
 * Get request status
 * @param {string} requestId - Request ID
 * @returns {Object|null} - Request status or null if not found
 */
function getRequestStatus(requestId) {
  const request = processingRequests.get(requestId);
  if (!request) {
    return null;
  }
  
  return {
    requestId: request.requestId,
    status: request.status,
    progress: request.progress,
    videoId: request.videoId,
    summaryId: request.summaryId,
    statusMessage: request.statusMessage,
    errorMessage: request.errorMessage
  };
}

/**
 * Get summary by ID
 * @param {string} summaryId - Summary ID
 * @returns {Object|null} - Summary or null if not found
 */
function getSummary(summaryId) {
  return summaries.get(summaryId) || null;
}

/**
 * Regenerate summary with new settings
 * @param {string} summaryId - Original summary ID
 * @param {Object} newSettings - New summary settings
 * @returns {Promise<Object>} - Processing request information
 */
async function regenerateSummary(summaryId, newSettings) {
  const originalSummary = summaries.get(summaryId);
  if (!originalSummary) {
    throw new Error('Summary not found');
  }
  
  const videoId = originalSummary.videoId;
  const metadata = originalSummary.videoMetadata;
  metadata.videoId = videoId;
  
  // Generate new request ID
  const requestId = `proc_${uuidv4()}`;
  
  // Store request in processing queue
  processingRequests.set(requestId, {
    requestId,
    videoId,
    status: 'processing',
    progress: 0,
    settings: newSettings,
    metadata,
    originalSummaryId: summaryId,
    createdAt: new Date().toISOString()
  });
  
  // Process video asynchronously
  processVideoAsync(requestId, videoId, metadata, newSettings);
  
  // Return initial response
  return {
    requestId,
    status: 'processing',
    estimatedTime: estimateProcessingTime(metadata.duration),
    videoId,
    originalSummaryId: summaryId
  };
}

/**
 * Estimate processing time based on video duration
 * @param {number} duration - Video duration in seconds
 * @returns {number} - Estimated processing time in seconds
 */
function estimateProcessingTime(duration) {
  // Base processing time
  const baseTime = 30;
  
  // Additional time based on video duration (1 second per 10 seconds of video)
  const durationFactor = Math.floor(parseInt(duration, 10) / 10);
  
  return baseTime + durationFactor;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 * @param {number|string} duration - Duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(duration) {
  // Convert to number if it's a string
  const seconds = parseInt(duration, 10);
  
  if (isNaN(seconds)) {
    return '00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

module.exports = {
  processVideo,
  getRequestStatus,
  getSummary,
  regenerateSummary
};