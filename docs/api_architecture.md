# API Architecture for YouTube Video Summarizer

## Overview

This document outlines the API architecture for the YouTube Video Summarizer application. The API layer serves as the bridge between the frontend user interface and the backend processing components, including YouTube data retrieval, LLM processing, and data storage.

## API Endpoints

### 1. Video Processing

#### `POST /api/videos/process`

Process a YouTube video URL and generate a summary.

**Request:**
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "settings": {
    "length": 3,
    "detailLevel": "standard",
    "includeTimestamps": true,
    "generateChapters": true,
    "tone": "casual",
    "complexity": 3,
    "audience": "general"
  }
}
```

**Response:**
```json
{
  "requestId": "proc_123456789",
  "status": "processing",
  "estimatedTime": 45,
  "videoId": "dQw4w9WgXcQ",
  "videoMetadata": {
    "title": "Video Title",
    "channel": "Channel Name",
    "duration": "10:30",
    "publishDate": "2025-05-10",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
}
```

#### `GET /api/videos/status/:requestId`

Check the status of a video processing request.

**Response:**
```json
{
  "requestId": "proc_123456789",
  "status": "completed",
  "progress": 100,
  "summaryId": "sum_987654321"
}
```

#### `GET /api/summaries/:summaryId`

Retrieve a generated summary.

**Response:**
```json
{
  "summaryId": "sum_987654321",
  "videoId": "dQw4w9WgXcQ",
  "videoMetadata": {
    "title": "Video Title",
    "channel": "Channel Name",
    "duration": "10:30",
    "publishDate": "2025-05-10",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  },
  "settings": {
    "length": 3,
    "detailLevel": "standard",
    "includeTimestamps": true,
    "generateChapters": true,
    "tone": "casual",
    "complexity": 3,
    "audience": "general"
  },
  "summary": {
    "brief": "One paragraph overview of the entire video",
    "chapters": [
      {
        "title": "Chapter Title",
        "timestamp": "00:00",
        "content": "Detailed description of this section",
        "keyPoints": ["Key point 1", "Key point 2"],
        "bulletPoints": [
          {
            "text": "Specific point with detail",
            "timestamp": "01:23"
          }
        ],
        "quotes": ["Direct quote from the video"]
      }
    ],
    "keyInsights": [
      "Major insight 1",
      "Major insight 2"
    ],
    "technicalTerms": [
      {
        "term": "Technical term",
        "definition": "Definition of the term"
      }
    ]
  },
  "socialShareable": {
    "twitter": "Optimized text for Twitter",
    "linkedin": "Optimized text for LinkedIn"
  },
  "createdAt": "2025-05-22T14:30:00Z"
}
```

#### `PUT /api/summaries/:summaryId/regenerate`

Regenerate a summary with new settings.

**Request:**
```json
{
  "settings": {
    "length": 5,
    "detailLevel": "technical",
    "includeTimestamps": true,
    "generateChapters": true,
    "tone": "academic",
    "complexity": 4,
    "audience": "expert"
  }
}
```

**Response:**
```json
{
  "requestId": "proc_987654321",
  "status": "processing",
  "estimatedTime": 30,
  "originalSummaryId": "sum_987654321"
}
```

### 2. Export and Sharing

#### `POST /api/summaries/:summaryId/export`

Export a summary to a specific format.

**Request:**
```json
{
  "format": "pdf",
  "options": {
    "includeVideoMetadata": true,
    "includeTimestamps": true,
    "includeTechnicalTerms": true
  }
}
```

**Response:**
```json
{
  "exportUrl": "https://api.videosummarizer.com/exports/exp_123456789.pdf",
  "expiresAt": "2025-05-23T14:30:00Z"
}
```

#### `POST /api/summaries/:summaryId/share`

Generate shareable content for social media.

**Request:**
```json
{
  "platform": "twitter",
  "customText": "Check out this amazing video summary!",
  "includeImage": true
}
```

**Response:**
```json
{
  "shareText": "Check out this amazing video summary! Key insights: AI diagnostic tools are achieving 94% accuracy in cancer detection. #AIHealthcare",
  "shareUrl": "https://videosummarizer.com/s/abc123",
  "imageUrl": "https://videosummarizer.com/share-images/abc123.png"
}
```

### 3. User Management

#### `POST /api/auth/register`

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "userId": "user_123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-05-22T14:30:00Z",
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/login`

Log in an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "userId": "user_123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "jwt_token_here"
}
```

#### `GET /api/users/me/history`

Get the user's summary history.

**Response:**
```json
{
  "summaries": [
    {
      "summaryId": "sum_987654321",
      "videoId": "dQw4w9WgXcQ",
      "videoTitle": "Video Title",
      "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "createdAt": "2025-05-22T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

### 4. Batch Processing

#### `POST /api/videos/batch`

Process multiple videos in batch.

**Request:**
```json
{
  "videoUrls": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=abcdefghijk"
  ],
  "settings": {
    "length": 3,
    "detailLevel": "standard",
    "includeTimestamps": true,
    "generateChapters": true,
    "tone": "casual",
    "complexity": 3,
    "audience": "general"
  }
}
```

**Response:**
```json
{
  "batchId": "batch_123456789",
  "status": "processing",
  "totalVideos": 2,
  "estimatedTime": 90,
  "requests": [
    {
      "requestId": "proc_123456789",
      "videoId": "dQw4w9WgXcQ",
      "status": "processing"
    },
    {
      "requestId": "proc_987654321",
      "videoId": "abcdefghijk",
      "status": "queued"
    }
  ]
}
```

#### `GET /api/videos/batch/:batchId`

Check the status of a batch processing request.

**Response:**
```json
{
  "batchId": "batch_123456789",
  "status": "partial",
  "progress": 50,
  "requests": [
    {
      "requestId": "proc_123456789",
      "videoId": "dQw4w9WgXcQ",
      "status": "completed",
      "summaryId": "sum_123456789"
    },
    {
      "requestId": "proc_987654321",
      "videoId": "abcdefghijk",
      "status": "processing",
      "progress": 30
    }
  ]
}
```

## API Integration with External Services

### 1. YouTube API Integration

The API interacts with YouTube's Data API v3 to:
- Validate video URLs and extract video IDs
- Fetch video metadata (title, channel, duration, etc.)
- Retrieve video captions/transcripts
- Access video thumbnails and other media assets

```javascript
// Example YouTube API integration
async function getVideoMetadata(videoId) {
  const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: YOUTUBE_API_KEY
    }
  });
  
  const videoData = response.data.items[0];
  
  return {
    title: videoData.snippet.title,
    channel: videoData.snippet.channelTitle,
    publishDate: videoData.snippet.publishedAt,
    duration: videoData.contentDetails.duration,
    viewCount: videoData.statistics.viewCount,
    likeCount: videoData.statistics.likeCount,
    thumbnailUrl: videoData.snippet.thumbnails.high.url
  };
}
```

### 2. LLM API Integration

The API connects to LLM providers (OpenAI, Anthropic, etc.) to:
- Process transcripts and generate summaries
- Create customized content based on user preferences
- Generate social media snippets and other derivative content

```javascript
// Example LLM API integration
async function generateSummary(transcript, settings) {
  const prompt = constructPrompt(transcript, settings);
  
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert video content analyzer."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 4000
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  return processSummaryResponse(response.data.choices[0].message.content);
}
```

## Authentication and Authorization

### JWT-Based Authentication

The API uses JSON Web Tokens (JWT) for authentication:
- Tokens are issued upon successful login
- Tokens contain encoded user information and permissions
- Tokens expire after a configurable period (default: 24 hours)

```javascript
// Example JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    
    req.user = user;
    next();
  });
}
```

### Role-Based Authorization

Different API endpoints require different permission levels:
- Public endpoints: No authentication required
- User endpoints: Require user authentication
- Admin endpoints: Require admin privileges

```javascript
// Example authorization middleware
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  next();
}
```

## Rate Limiting and Quotas

### User Tiers

The API implements different rate limits based on user tiers:
- Free tier: 5 summaries per day, limited customization
- Basic tier: 20 summaries per day, standard features
- Premium tier: 100 summaries per day, all features
- Enterprise tier: Custom limits and dedicated resources

```javascript
// Example rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    switch(req.user.tier) {
      case 'free': return 5;
      case 'basic': return 20;
      case 'premium': return 100;
      case 'enterprise': return req.user.customLimit || 500;
      default: return 3;
    }
  },
  message: { error: 'Rate limit exceeded. Please upgrade your plan for more summaries.' }
});
```

## Error Handling

### Standardized Error Responses

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested summary could not be found",
    "details": "Summary ID sum_123456789 does not exist in the database",
    "requestId": "req_abcdefg123"
  }
}
```

### Common Error Codes

- `INVALID_REQUEST`: Malformed request or invalid parameters
- `AUTHENTICATION_FAILED`: Invalid credentials or expired token
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `RATE_LIMIT_EXCEEDED`: User has exceeded their quota
- `PROCESSING_FAILED`: Error during video or transcript processing
- `EXTERNAL_API_ERROR`: Error from YouTube or LLM API
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Caching Strategy

### Multi-Level Caching

The API implements a multi-level caching strategy:

1. **Redis Cache (L1)**
   - Store frequently accessed summaries
   - Cache video metadata
   - Short TTL (1-24 hours)

2. **Database Cache (L2)**
   - Store all generated summaries
   - Index by video ID and settings hash
   - Long-term persistence

3. **CDN Cache (L3)**
   - Cache exported files and images
   - Distributed globally for fast access
   - Medium TTL (7 days)

```javascript
// Example caching middleware
async function cacheSummary(req, res, next) {
  const summaryId = req.params.summaryId;
  
  // Try L1 cache first
  const cachedSummary = await redisClient.get(`summary:${summaryId}`);
  if (cachedSummary) {
    return res.json(JSON.parse(cachedSummary));
  }
  
  // Continue to database lookup
  next();
}
```

## Webhook Notifications

### Event-Based Notifications

The API supports webhook notifications for asynchronous processes:

```javascript
// Example webhook notification
async function notifyWebhook(userId, event, data) {
  const user = await User.findById(userId);
  
  if (!user.webhookUrl) return;
  
  try {
    await axios.post(user.webhookUrl, {
      event,
      data,
      timestamp: new Date().toISOString(),
      signature: generateSignature(user.webhookSecret, event, data)
    });
  } catch (error) {
    console.error('Webhook notification failed:', error);
  }
}
```

### Supported Events

- `summary.started`: Summary generation has started
- `summary.completed`: Summary generation is complete
- `summary.failed`: Summary generation has failed
- `export.completed`: Export has been generated
- `batch.completed`: Batch processing is complete

## API Versioning

The API uses URL-based versioning to ensure backward compatibility:

- `/api/v1/...`: Initial API version
- `/api/v2/...`: Updated API with new features
- `/api/latest/...`: Always points to the most recent version

## Performance Monitoring

### Key Metrics

The API tracks the following performance metrics:

- Request latency by endpoint
- Success/error rates
- Processing time for video summarization
- Cache hit/miss rates
- External API response times
- Resource utilization (CPU, memory, network)

### Logging and Tracing

Each request is assigned a unique request ID that is propagated through all processing stages for end-to-end tracing.

```javascript
// Example request logging middleware
function requestLogger(req, res, next) {
  const requestId = uuidv4();
  req.requestId = requestId;
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || 'anonymous'
    });
  });
  
  next();
}
```

## Conclusion

This API architecture provides a robust foundation for the YouTube Video Summarizer application. It enables efficient video processing, customizable summaries, and seamless integration with external services while maintaining high performance, security, and scalability.