/**
 * Simple test script for YouTube Video Summarizer API
 * 
 * Usage: node test-api.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:12000/api';
const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up

// Test settings
const testSettings = {
  length: 3,
  detailLevel: 'standard',
  includeTimestamps: true,
  generateChapters: true,
  tone: 'casual',
  complexity: 2,
  audience: 'general'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Log a message with color
 */
function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

/**
 * Test the API endpoints
 */
async function testApi() {
  try {
    log('🧪 Testing YouTube Video Summarizer API', colors.bright + colors.cyan);
    log('----------------------------------------', colors.cyan);
    
    // Test 1: Validate URL
    log('\n1️⃣ Testing URL validation endpoint...', colors.bright);
    const validationResponse = await axios.get(`${API_BASE_URL}/videos/validate`, {
      params: { url: TEST_VIDEO_URL }
    });
    
    log(`✅ URL validation successful: ${JSON.stringify(validationResponse.data, null, 2)}`, colors.green);
    
    // Test 2: Process video
    log('\n2️⃣ Testing video processing endpoint...', colors.bright);
    const processResponse = await axios.post(`${API_BASE_URL}/videos/process`, {
      videoUrl: TEST_VIDEO_URL,
      settings: testSettings
    });
    
    const { requestId } = processResponse.data;
    log(`✅ Video processing initiated: Request ID = ${requestId}`, colors.green);
    
    // Test 3: Check status
    log('\n3️⃣ Testing status endpoint...', colors.bright);
    let status = { status: 'processing' };
    let attempts = 0;
    
    while (status.status === 'processing' && attempts < 3) {
      attempts++;
      const statusResponse = await axios.get(`${API_BASE_URL}/videos/status/${requestId}`);
      status = statusResponse.data;
      
      log(`ℹ️ Status check ${attempts}: ${status.status} (${status.progress}%)`, colors.yellow);
      
      if (status.status === 'processing') {
        log('⏳ Waiting 3 seconds before next status check...', colors.yellow);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (status.status === 'completed') {
      // Test 4: Get summary
      log('\n4️⃣ Testing summary retrieval endpoint...', colors.bright);
      const summaryResponse = await axios.get(`${API_BASE_URL}/summaries/${status.summaryId}`);
      
      log(`✅ Summary retrieved successfully!`, colors.green);
      log(`📝 Summary brief: ${summaryResponse.data.summary.brief}`, colors.cyan);
      log(`📊 Number of chapters: ${summaryResponse.data.summary.chapters.length}`, colors.cyan);
      log(`💡 Number of key insights: ${summaryResponse.data.summary.keyInsights.length}`, colors.cyan);
      
      // Test 5: Regenerate summary
      log('\n5️⃣ Testing summary regeneration endpoint...', colors.bright);
      const newSettings = { ...testSettings, tone: 'formal', complexity: 4 };
      
      const regenerateResponse = await axios.put(`${API_BASE_URL}/summaries/${status.summaryId}/regenerate`, {
        settings: newSettings
      });
      
      log(`✅ Summary regeneration initiated: New Request ID = ${regenerateResponse.data.requestId}`, colors.green);
    } else {
      log(`⚠️ Summary not completed within timeout period. Current status: ${status.status}`, colors.yellow);
    }
    
    log('\n✨ API tests completed!', colors.bright + colors.green);
    
  } catch (error) {
    log('\n❌ Error during API testing:', colors.red);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      log(`Status: ${error.response.status}`, colors.red);
      log(`Data: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
    } else if (error.request) {
      // The request was made but no response was received
      log('No response received from server. Is the server running?', colors.red);
    } else {
      // Something happened in setting up the request that triggered an Error
      log(`Error message: ${error.message}`, colors.red);
    }
  }
}

// Run the tests
testApi();