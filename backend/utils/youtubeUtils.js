const axios = require('axios');
const ytdl = require('ytdl-core');
const { YoutubeTranscript } = require('youtube-transcript');
const config = require('./config');

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
function extractVideoId(url) {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^([^"&?\/\s]{11})$/i // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Validate if a YouTube video exists and is accessible
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>} - True if video exists and is accessible
 */
async function validateVideo(videoId) {
  try {
    const videoInfo = await ytdl.getBasicInfo(videoId);
    return !!videoInfo;
  } catch (error) {
    console.error(`Error validating video ${videoId}:`, error.message);
    return false;
  }
}

/**
 * Get video metadata using ytdl-core
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video metadata
 */
async function getVideoMetadata(videoId) {
  try {
    const info = await ytdl.getBasicInfo(videoId);
    const videoDetails = info.videoDetails;
    
    return {
      title: videoDetails.title,
      channel: videoDetails.author.name,
      channelId: videoDetails.channelId,
      duration: videoDetails.lengthSeconds,
      publishDate: videoDetails.publishDate,
      viewCount: videoDetails.viewCount,
      thumbnailUrl: videoDetails.thumbnails.length > 0 
        ? videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url 
        : null,
      description: videoDetails.description,
      keywords: videoDetails.keywords || []
    };
  } catch (error) {
    console.error(`Error fetching metadata for video ${videoId}:`, error.message);
    throw new Error(`Failed to fetch video metadata: ${error.message}`);
  }
}

/**
 * Get video transcript using youtube-transcript package
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Array>} - Transcript segments with text and timestamps
 */
async function getVideoTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript;
  } catch (error) {
    console.error(`Error fetching transcript for video ${videoId}:`, error.message);
    throw new Error(`Failed to fetch video transcript: ${error.message}`);
  }
}

/**
 * Format transcript for LLM processing
 * @param {Array} transcript - Raw transcript segments
 * @returns {string} - Formatted transcript text with timestamps
 */
function formatTranscriptForLLM(transcript) {
  if (!transcript || transcript.length === 0) {
    return '';
  }
  
  return transcript.map(segment => {
    const minutes = Math.floor(segment.offset / 60000);
    const seconds = Math.floor((segment.offset % 60000) / 1000);
    const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
    return `${timestamp} ${segment.text}`;
  }).join('\n');
}

/**
 * Get enhanced video metadata using YouTube Data API (if API key is available)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Enhanced video metadata
 */
async function getEnhancedMetadata(videoId) {
  // If no YouTube API key is available, return null
  if (!config.youtubeApiKey) {
    return null;
  }
  
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails,statistics,topicDetails',
        id: videoId,
        key: config.youtubeApiKey
      }
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const videoData = response.data.items[0];
    
    return {
      title: videoData.snippet.title,
      channel: videoData.snippet.channelTitle,
      channelId: videoData.snippet.channelId,
      publishDate: videoData.snippet.publishedAt,
      description: videoData.snippet.description,
      tags: videoData.snippet.tags || [],
      categoryId: videoData.snippet.categoryId,
      duration: videoData.contentDetails.duration,
      viewCount: videoData.statistics.viewCount,
      likeCount: videoData.statistics.likeCount,
      commentCount: videoData.statistics.commentCount,
      topics: videoData.topicDetails ? videoData.topicDetails.topicCategories : [],
      thumbnails: videoData.snippet.thumbnails
    };
  } catch (error) {
    console.error(`Error fetching enhanced metadata for video ${videoId}:`, error.message);
    return null;
  }
}

module.exports = {
  extractVideoId,
  validateVideo,
  getVideoMetadata,
  getVideoTranscript,
  formatTranscriptForLLM,
  getEnhancedMetadata
};