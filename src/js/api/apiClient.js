/**
 * API Client for YouTube Video Summarizer
 * Handles all communication with the backend API
 */

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.pollInterval = 3000; // 3 seconds
  }

  /**
   * Process a YouTube video URL
   * @param {string} videoUrl - YouTube video URL
   * @param {Object} settings - Summary customization settings
   * @returns {Promise<Object>} - Processing request information
   */
  async processVideo(videoUrl, settings = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/videos/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoUrl, settings })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to process video');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error - processVideo:', error);
      throw error;
    }
  }

  /**
   * Get the status of a video processing request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} - Request status
   */
  async getRequestStatus(requestId) {
    try {
      const response = await fetch(`${this.baseUrl}/videos/status/${requestId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get request status');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error - getRequestStatus:', error);
      throw error;
    }
  }

  /**
   * Poll for request status until completed or failed
   * @param {string} requestId - Request ID
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<Object>} - Final status with summary ID if completed
   */
  async pollRequestStatus(requestId, onProgress) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getRequestStatus(requestId);
          
          // Call progress callback if provided
          if (onProgress && typeof onProgress === 'function') {
            onProgress(status);
          }
          
          if (status.status === 'completed') {
            resolve(status);
            return;
          } else if (status.status === 'failed') {
            reject(new Error(status.errorMessage || 'Processing failed'));
            return;
          }
          
          // Continue polling
          setTimeout(poll, this.pollInterval);
        } catch (error) {
          reject(error);
        }
      };
      
      // Start polling
      poll();
    });
  }

  /**
   * Get a summary by ID
   * @param {string} summaryId - Summary ID
   * @returns {Promise<Object>} - Summary data
   */
  async getSummary(summaryId) {
    try {
      const response = await fetch(`${this.baseUrl}/summaries/${summaryId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get summary');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error - getSummary:', error);
      throw error;
    }
  }

  /**
   * Regenerate a summary with new settings
   * @param {string} summaryId - Summary ID
   * @param {Object} settings - New summary settings
   * @returns {Promise<Object>} - Processing request information
   */
  async regenerateSummary(summaryId, settings) {
    try {
      const response = await fetch(`${this.baseUrl}/summaries/${summaryId}/regenerate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to regenerate summary');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error - regenerateSummary:', error);
      throw error;
    }
  }

  /**
   * Validate a YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Validation result
   */
  async validateUrl(url) {
    try {
      const response = await fetch(`${this.baseUrl}/videos/validate?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to validate URL');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error - validateUrl:', error);
      throw error;
    }
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;