require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 12000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OpenRouter API (OpenAI compatible)
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterApiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
  defaultModel: process.env.DEFAULT_MODEL || 'openai/gpt-3.5-turbo',
  
  // YouTube API
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  
  // JWT for authentication
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_for_development',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};