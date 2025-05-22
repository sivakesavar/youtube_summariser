// Main JavaScript for YouTube Video Summarizer
import apiClient from './api/apiClient.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const videoUrlInput = document.getElementById('video-url');
    const pasteBtn = document.querySelector('.paste-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const lengthSlider = document.getElementById('length-slider');
    const detailLevel = document.getElementById('detail-level');
    const timestampsToggle = document.getElementById('timestamps-toggle');
    const chaptersToggle = document.getElementById('chapters-toggle');
    const complexitySlider = document.getElementById('complexity-slider');
    const audienceSelect = document.getElementById('audience');
    const applySettingsBtn = document.querySelector('.apply-settings-btn');
    const videoPlayerContainer = document.querySelector('.video-player');
    const videoInfoElement = document.querySelector('.video-info');
    const summaryContentElement = document.querySelector('.summary-content');
    const keyInsightsElement = document.querySelector('.key-insights ul');
    const technicalTermsElement = document.querySelector('.technical-terms ul');
    const formatButtons = document.querySelectorAll('.format-btn');
    const shareButtons = document.querySelectorAll('.share-btn');
    
    // State Management
    let currentState = {
        videoId: null,
        requestId: null,
        summaryId: null,
        isProcessing: false,
        summary: null,
        settings: {
            length: 3,
            detailLevel: 'standard',
            includeTimestamps: true,
            generateChapters: true,
            tone: 'casual',
            complexity: 3,
            audience: 'general'
        },
        player: null
    };
    
    // Event Listeners
    pasteBtn.addEventListener('click', handlePaste);
    submitBtn.addEventListener('click', handleSubmit);
    applySettingsBtn.addEventListener('click', handleApplySettings);
    
    // Format button selection
    formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            formatButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Functions
    
    /**
     * Handle paste button click - get clipboard content
     */
    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            videoUrlInput.value = text;
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            showNotification('Could not access clipboard. Please paste the URL manually.', 'error');
        }
    }
    
    /**
     * Handle submit button click - process video URL
     */
    async function handleSubmit() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showNotification('Please enter a YouTube URL', 'error');
            return;
        }
        
        // Show loading state
        setProcessingState(true);
        
        try {
            // Validate URL first
            const validationResult = await apiClient.validateUrl(url);
            
            if (!validationResult.valid) {
                throw new Error(validationResult.error || 'Invalid YouTube URL');
            }
            
            // Get current settings from UI
            const settings = getCurrentSettings();
            
            // Process video
            const processResult = await apiClient.processVideo(url, settings);
            
            // Update state
            currentState.videoId = processResult.videoId;
            currentState.requestId = processResult.requestId;
            
            // Update UI with video metadata
            updateVideoInfo(processResult.videoMetadata);
            
            // Initialize YouTube player
            initializeYouTubePlayer(processResult.videoId);
            
            // Show processing message
            showProcessingMessage(processResult.estimatedTime);
            
            // Poll for completion
            apiClient.pollRequestStatus(processResult.requestId, updateProgressUI)
                .then(finalStatus => {
                    // Processing completed successfully
                    currentState.summaryId = finalStatus.summaryId;
                    
                    // Fetch and display summary
                    return apiClient.getSummary(finalStatus.summaryId);
                })
                .then(summary => {
                    // Update state with summary
                    currentState.summary = summary;
                    
                    // Update UI with summary
                    updateSummaryDisplay(summary);
                    
                    // Reset processing state
                    setProcessingState(false);
                })
                .catch(error => {
                    console.error('Error during processing:', error);
                    showNotification(`Processing failed: ${error.message}`, 'error');
                    setProcessingState(false);
                });
            
        } catch (error) {
            console.error('Error submitting video:', error);
            showNotification(`Error: ${error.message}`, 'error');
            setProcessingState(false);
        }
    }
    
    /**
     * Handle apply settings button click
     */
    async function handleApplySettings() {
        if (!currentState.summaryId) {
            showNotification('No summary to regenerate. Please process a video first.', 'error');
            return;
        }
        
        // Show loading state
        applySettingsBtn.disabled = true;
        applySettingsBtn.textContent = 'Applying...';
        
        try {
            // Get current settings from UI
            const settings = getCurrentSettings();
            
            // Regenerate summary with new settings
            const regenerateResult = await apiClient.regenerateSummary(currentState.summaryId, settings);
            
            // Update state
            currentState.requestId = regenerateResult.requestId;
            
            // Show processing message
            showProcessingMessage(regenerateResult.estimatedTime);
            
            // Poll for completion
            apiClient.pollRequestStatus(regenerateResult.requestId, updateProgressUI)
                .then(finalStatus => {
                    // Processing completed successfully
                    currentState.summaryId = finalStatus.summaryId;
                    
                    // Fetch and display summary
                    return apiClient.getSummary(finalStatus.summaryId);
                })
                .then(summary => {
                    // Update state with summary
                    currentState.summary = summary;
                    
                    // Update UI with summary
                    updateSummaryDisplay(summary);
                    
                    // Reset button state
                    applySettingsBtn.disabled = false;
                    applySettingsBtn.textContent = 'Apply Settings';
                })
                .catch(error => {
                    console.error('Error during regeneration:', error);
                    showNotification(`Regeneration failed: ${error.message}`, 'error');
                    
                    // Reset button state
                    applySettingsBtn.disabled = false;
                    applySettingsBtn.textContent = 'Apply Settings';
                });
            
        } catch (error) {
            console.error('Error applying settings:', error);
            showNotification(`Error: ${error.message}`, 'error');
            
            // Reset button state
            applySettingsBtn.disabled = false;
            applySettingsBtn.textContent = 'Apply Settings';
        }
    }
    
    /**
     * Get current settings from UI controls
     */
    function getCurrentSettings() {
        return {
            length: parseInt(lengthSlider.value),
            detailLevel: detailLevel.value,
            includeTimestamps: timestampsToggle.checked,
            generateChapters: chaptersToggle.checked,
            tone: document.querySelector('input[name="tone"]:checked').value,
            complexity: parseInt(complexitySlider.value),
            audience: audienceSelect.value
        };
    }
    
    /**
     * Set processing state
     */
    function setProcessingState(isProcessing) {
        currentState.isProcessing = isProcessing;
        submitBtn.disabled = isProcessing;
        submitBtn.textContent = isProcessing ? 'Processing...' : 'Summarize';
    }
    
    /**
     * Show processing message with estimated time
     */
    function showProcessingMessage(estimatedTime) {
        const processingMessage = document.createElement('div');
        processingMessage.className = 'processing-message';
        processingMessage.innerHTML = `
            <div class="spinner"></div>
            <p>Processing your video. This may take up to ${estimatedTime} seconds.</p>
            <div class="progress-container">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <p class="status-text">Initializing...</p>
        `;
        
        // Clear existing content and add processing message
        summaryContentElement.innerHTML = '';
        summaryContentElement.appendChild(processingMessage);
    }
    
    /**
     * Update progress UI during processing
     */
    function updateProgressUI(status) {
        const progressBar = document.querySelector('.progress-bar');
        const statusText = document.querySelector('.status-text');
        
        if (progressBar && statusText) {
            progressBar.style.width = `${status.progress}%`;
            statusText.textContent = status.statusMessage || `Processing: ${status.progress}%`;
        }
    }
    
    /**
     * Initialize YouTube player
     */
    function initializeYouTubePlayer(videoId) {
        // Clear existing player
        videoPlayerContainer.innerHTML = '';
        
        // Create iframe for YouTube player
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        // Add iframe to container
        videoPlayerContainer.appendChild(iframe);
        
        // Store reference to player
        currentState.videoId = videoId;
    }
    
    /**
     * Update video info section with metadata
     */
    function updateVideoInfo(metadata) {
        if (videoInfoElement) {
            videoInfoElement.innerHTML = `
                <h3>${metadata.title}</h3>
                <p>${metadata.channel} • ${metadata.duration}</p>
            `;
        }
    }
    
    /**
     * Update summary display with generated summary
     */
    function updateSummaryDisplay(summary) {
        if (!summaryContentElement || !summary) return;
        
        // Clear existing content
        summaryContentElement.innerHTML = '';
        
        // Add brief overview
        if (summary.summary.brief) {
            const briefElement = document.createElement('div');
            briefElement.className = 'brief-overview';
            briefElement.innerHTML = `<p>${summary.summary.brief}</p>`;
            summaryContentElement.appendChild(briefElement);
        }
        
        // Add chapters
        if (summary.summary.chapters && summary.summary.chapters.length > 0) {
            summary.summary.chapters.forEach(chapter => {
                const chapterElement = document.createElement('div');
                chapterElement.className = 'chapter';
                
                // Create chapter header
                const headerElement = document.createElement('div');
                headerElement.className = 'chapter-header';
                headerElement.innerHTML = `
                    <h4><span class="timestamp">${chapter.timestamp}</span> ${chapter.title}</h4>
                    <button class="expand-btn"><i class="fas fa-chevron-down"></i></button>
                `;
                
                // Create chapter content
                const contentElement = document.createElement('div');
                contentElement.className = 'chapter-content';
                contentElement.style.display = 'none';
                
                // Add main content
                contentElement.innerHTML = `<p>${chapter.content}</p>`;
                
                // Add bullet points if available
                if (chapter.bulletPoints && chapter.bulletPoints.length > 0) {
                    const bulletList = document.createElement('ul');
                    
                    chapter.bulletPoints.forEach(point => {
                        const listItem = document.createElement('li');
                        if (point.timestamp) {
                            listItem.innerHTML = `<span class="timestamp">${point.timestamp}</span> ${point.text}`;
                        } else {
                            listItem.textContent = point.text;
                        }
                        bulletList.appendChild(listItem);
                    });
                    
                    contentElement.appendChild(bulletList);
                }
                
                // Add key points if available
                if (chapter.keyPoints && chapter.keyPoints.length > 0) {
                    chapter.keyPoints.forEach(point => {
                        const keyPointElement = document.createElement('p');
                        keyPointElement.className = 'key-point';
                        keyPointElement.textContent = `Key point: ${point}`;
                        contentElement.appendChild(keyPointElement);
                    });
                }
                
                // Add quotes if available
                if (chapter.quotes && chapter.quotes.length > 0) {
                    chapter.quotes.forEach(quote => {
                        const quoteElement = document.createElement('p');
                        quoteElement.className = 'quote';
                        quoteElement.textContent = quote;
                        contentElement.appendChild(quoteElement);
                    });
                }
                
                // Add header and content to chapter
                chapterElement.appendChild(headerElement);
                chapterElement.appendChild(contentElement);
                
                // Add chapter to summary
                summaryContentElement.appendChild(chapterElement);
                
                // Add click event to header
                headerElement.addEventListener('click', () => {
                    const isHidden = contentElement.style.display === 'none';
                    contentElement.style.display = isHidden ? 'block' : 'none';
                    headerElement.querySelector('.expand-btn i').className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
                });
            });
        }
        
        // Update key insights
        if (keyInsightsElement && summary.summary.keyInsights) {
            keyInsightsElement.innerHTML = summary.summary.keyInsights.map(insight => `<li>${insight}</li>`).join('');
        }
        
        // Update technical terms
        if (technicalTermsElement && summary.summary.technicalTerms) {
            technicalTermsElement.innerHTML = summary.summary.technicalTerms.map(term => 
                `<li><strong>${term.term}</strong>: ${term.definition}</li>`
            ).join('');
        }
        
        // Add timestamp click handlers
        document.querySelectorAll('.timestamp').forEach(timestamp => {
            timestamp.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent chapter toggle
                const time = parseTimestamp(timestamp.textContent);
                seekToVideoTime(time);
            });
        });
    }
    
    /**
     * Parse timestamp string to seconds
     */
    function parseTimestamp(timestamp) {
        const parts = timestamp.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        return 0;
    }
    
    /**
     * Seek to specific time in video
     */
    function seekToVideoTime(seconds) {
        const iframe = document.querySelector('.video-player iframe');
        if (iframe) {
            // Use YouTube iframe API to seek
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [seconds, true]
            }), '*');
        }
    }
    
    /**
     * Show notification message
     */
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Initialize UI
    function initializeUI() {
        // Add notification styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    color: white;
                    z-index: 1000;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: opacity 0.5s;
                }
                .notification.info {
                    background-color: #4285f4;
                }
                .notification.error {
                    background-color: #ea4335;
                }
                .notification.success {
                    background-color: #34a853;
                }
                .notification.fade-out {
                    opacity: 0;
                }
                .processing-message {
                    text-align: center;
                    padding: 2rem;
                }
                .spinner {
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(66, 133, 244, 0.2);
                    border-radius: 50%;
                    border-top-color: #4285f4;
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .progress-container {
                    width: 100%;
                    height: 10px;
                    background-color: #e0e0e0;
                    border-radius: 5px;
                    margin: 1rem 0;
                }
                .progress-bar {
                    height: 100%;
                    background-color: #4285f4;
                    border-radius: 5px;
                    transition: width 0.3s ease;
                }
                .status-text {
                    color: #757575;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('UI initialized');
    }
    
    // Call initialization
    initializeUI();
});