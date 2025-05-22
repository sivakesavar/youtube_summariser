const { OpenAI } = require('openai');
const config = require('../utils/config');

// Initialize OpenAI client with OpenRouter endpoint
const openai = new OpenAI({
  apiKey: config.openrouterApiKey,
  baseURL: config.openrouterApiUrl,
  defaultHeaders: {
    'HTTP-Referer': 'https://youtube-summarizer.example.com', // Replace with your actual domain
    'X-Title': 'YouTube Video Summarizer'
  }
});

/**
 * Generate a summary of a video transcript using LLM
 * @param {Object} data - Data for summary generation
 * @param {string} data.transcript - Formatted video transcript
 * @param {Object} data.metadata - Video metadata
 * @param {Object} data.settings - Summary customization settings
 * @returns {Promise<Object>} - Generated summary
 */
async function generateSummary({ transcript, metadata, settings }) {
  try {
    // Default settings if not provided
    const defaultSettings = {
      length: 3, // 1-5 scale (concise to comprehensive)
      detailLevel: 'standard', // key-points, standard, comprehensive, technical
      includeTimestamps: true,
      generateChapters: true,
      tone: 'casual', // casual, formal, academic, technical
      complexity: 3, // 1-5 scale (simple to advanced)
      audience: 'general' // general, student, professional, expert
    };
    
    // Merge default settings with provided settings
    const mergedSettings = { ...defaultSettings, ...settings };
    
    // Construct system prompt based on settings
    const systemPrompt = constructSystemPrompt(mergedSettings);
    
    // Construct user prompt with transcript and metadata
    const userPrompt = constructUserPrompt(transcript, metadata, mergedSettings);
    
    // Call LLM API
    const response = await openai.chat.completions.create({
      model: config.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent outputs
      max_tokens: 4000, // Adjust based on expected summary length
      response_format: { type: 'json_object' } // Request JSON response
    });
    
    // Parse and validate the response
    const summaryContent = JSON.parse(response.choices[0].message.content);
    
    // Add metadata to the summary
    return {
      videoId: metadata.videoId,
      videoMetadata: {
        title: metadata.title,
        channel: metadata.channel,
        duration: formatDuration(metadata.duration),
        publishDate: metadata.publishDate,
        thumbnailUrl: metadata.thumbnailUrl
      },
      settings: mergedSettings,
      summary: summaryContent,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

/**
 * Construct system prompt based on settings
 * @param {Object} settings - Summary customization settings
 * @returns {string} - System prompt
 */
function constructSystemPrompt(settings) {
  // Tone instructions based on settings
  const toneInstructions = getToneInstructions(settings.tone);
  
  // Complexity instructions based on settings
  const complexityInstructions = getComplexityInstructions(settings.complexity);
  
  // Audience instructions based on settings
  const audienceInstructions = getAudienceInstructions(settings.audience);
  
  return `You are an expert video content analyzer specializing in creating high-quality summaries of YouTube videos.

Your task is to create a ${getLengthDescription(settings.length)} summary of the video transcript I will provide.

${toneInstructions}
${complexityInstructions}
${audienceInstructions}

${settings.detailLevel === 'key-points' ? 'Focus only on the most important key points and main ideas.' : ''}
${settings.detailLevel === 'comprehensive' ? 'Provide a comprehensive analysis covering all significant points and nuances.' : ''}
${settings.detailLevel === 'technical' ? 'Include technical details, methodologies, and specialized information where relevant.' : ''}

${settings.includeTimestamps ? 'Include relevant timestamps throughout the summary to help users navigate to specific parts of the video.' : 'Do not include timestamps in the summary.'}
${settings.generateChapters ? 'Organize the content into logical chapters or sections with descriptive titles.' : 'Present the summary as a continuous text without chapter divisions.'}

Your response must be a valid JSON object with the following structure:
{
  "brief": "A one-paragraph overview of the entire video",
  "chapters": [
    {
      "title": "Chapter title",
      "timestamp": "MM:SS",
      "content": "Detailed description of this section",
      "keyPoints": ["Key point 1", "Key point 2"],
      "bulletPoints": [
        {"text": "Specific point with detail", "timestamp": "MM:SS"}
      ],
      "quotes": ["Direct quote from the video"]
    }
  ],
  "keyInsights": ["Major insight 1", "Major insight 2"],
  "technicalTerms": [
    {"term": "Technical term", "definition": "Definition of the term"}
  ]
}

Ensure all timestamps are in MM:SS format and correspond to actual points in the video.`;
}

/**
 * Construct user prompt with transcript and metadata
 * @param {string} transcript - Formatted video transcript
 * @param {Object} metadata - Video metadata
 * @param {Object} settings - Summary customization settings
 * @returns {string} - User prompt
 */
function constructUserPrompt(transcript, metadata, settings) {
  return `Please summarize the following YouTube video:

Title: ${metadata.title}
Channel: ${metadata.channel}
Duration: ${formatDuration(metadata.duration)}
${metadata.description ? `Description: ${metadata.description.substring(0, 500)}${metadata.description.length > 500 ? '...' : ''}` : ''}

Transcript:
${transcript}

Please generate a ${getLengthDescription(settings.length)} summary following all the instructions provided earlier.`;
}

/**
 * Get tone instructions based on tone setting
 * @param {string} tone - Tone setting (casual, formal, academic, technical)
 * @returns {string} - Tone instructions
 */
function getToneInstructions(tone) {
  switch (tone) {
    case 'casual':
      return 'Use a conversational, friendly tone that is easy to understand. Feel free to use contractions and everyday language.';
    case 'formal':
      return 'Use a professional, business-appropriate tone. Avoid contractions and colloquialisms.';
    case 'academic':
      return 'Use an academic tone suitable for educational contexts. Be precise with terminology and maintain scholarly objectivity.';
    case 'technical':
      return 'Use a technical tone appropriate for specialists. Include domain-specific terminology where relevant.';
    default:
      return 'Use a balanced, neutral tone that is accessible to a general audience.';
  }
}

/**
 * Get complexity instructions based on complexity setting
 * @param {number} complexity - Complexity setting (1-5)
 * @returns {string} - Complexity instructions
 */
function getComplexityInstructions(complexity) {
  switch (complexity) {
    case 1:
      return 'Use simple language and short sentences. Avoid jargon and explain any technical terms.';
    case 2:
      return 'Use straightforward language accessible to most readers. Briefly explain specialized concepts.';
    case 3:
      return 'Use moderately complex language. You can include some specialized terminology with context.';
    case 4:
      return 'Use sophisticated language appropriate for well-informed readers. Technical terms can be used where appropriate.';
    case 5:
      return 'Use advanced language suitable for experts. Specialized terminology can be used freely.';
    default:
      return 'Use balanced language that is accessible to most readers while accurately conveying the content.';
  }
}

/**
 * Get audience instructions based on audience setting
 * @param {string} audience - Audience setting (general, student, professional, expert)
 * @returns {string} - Audience instructions
 */
function getAudienceInstructions(audience) {
  switch (audience) {
    case 'general':
      return 'Target a general audience with no specialized knowledge of the subject.';
    case 'student':
      return 'Target students who are learning about this subject. Include explanations of concepts and focus on educational value.';
    case 'professional':
      return 'Target professionals who work in this field. Focus on practical applications and industry relevance.';
    case 'expert':
      return 'Target experts with deep knowledge of the subject. Focus on advanced concepts and nuanced details.';
    default:
      return 'Target a general audience with no specialized knowledge of the subject.';
  }
}

/**
 * Get length description based on length setting
 * @param {number} length - Length setting (1-5)
 * @returns {string} - Length description
 */
function getLengthDescription(length) {
  switch (length) {
    case 1:
      return 'very concise';
    case 2:
      return 'brief';
    case 3:
      return 'moderately detailed';
    case 4:
      return 'detailed';
    case 5:
      return 'comprehensive';
    default:
      return 'moderately detailed';
  }
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

/**
 * Generate social media snippets from a summary
 * @param {Object} summary - Generated summary
 * @param {string} platform - Social media platform (twitter, linkedin)
 * @returns {Promise<string>} - Social media snippet
 */
async function generateSocialSnippet(summary, platform) {
  try {
    const maxLength = platform === 'twitter' ? 280 : 1000;
    
    const prompt = `Create a shareable ${platform} post about this video:
    
Title: ${summary.videoMetadata.title}
Channel: ${summary.videoMetadata.channel}

Key insights:
${summary.summary.keyInsights.join('\n')}

The post should be engaging, informative, and under ${maxLength} characters. Include relevant hashtags.`;

    const response = await openai.chat.completions.create({
      model: config.defaultModel,
      messages: [
        { role: 'system', content: `You are a social media expert who creates engaging ${platform} posts.` },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating ${platform} snippet:`, error);
    throw new Error(`Failed to generate social media snippet: ${error.message}`);
  }
}

module.exports = {
  generateSummary,
  generateSocialSnippet
};