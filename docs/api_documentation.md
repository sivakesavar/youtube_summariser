# YouTube Video Summarizer API Documentation

This document provides detailed information about the YouTube Video Summarizer API endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:12000/api
```

## Authentication

Currently, the API does not require authentication for development purposes. In a production environment, you would implement authentication using JWT or API keys.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per 15-minute window per IP address
- Exceeding this limit will result in a 429 Too Many Requests response

## API Endpoints

### 1. Validate YouTube URL

Validates if a URL is a valid YouTube video URL and returns basic metadata.

**Endpoint:** `GET /videos/validate`

**Query Parameters:**
- `url` (required): YouTube video URL to validate

**Response:**
```json
{
  "valid": true,
  "videoId": "dQw4w9WgXcQ",
  "metadata": {
    "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    "channel": "Rick Astley",
    "duration": "3:33",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid URL
- `500 Internal Server Error`: Server-side error

### 2. Process Video

Initiates the processing of a YouTube video to generate a summary.

**Endpoint:** `POST /videos/process`

**Request Body:**
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

**Settings Options:**
- `length`: 1-5 scale (concise to comprehensive)
- `detailLevel`: "key-points", "standard", "comprehensive", "technical"
- `includeTimestamps`: boolean
- `generateChapters`: boolean
- `tone`: "casual", "formal", "academic", "technical"
- `complexity`: 1-5 scale (simple to advanced)
- `audience`: "general", "student", "professional", "expert"

**Response:**
```json
{
  "requestId": "proc_1234567890",
  "status": "processing",
  "estimatedTime": 45,
  "videoId": "dQw4w9WgXcQ",
  "videoMetadata": {
    "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    "channel": "Rick Astley",
    "duration": "3:33",
    "publishDate": "2009-10-25",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid URL/settings
- `404 Not Found`: Video not found or not accessible
- `500 Internal Server Error`: Server-side error

### 3. Get Processing Status

Checks the status of a video processing request.

**Endpoint:** `GET /videos/status/:requestId`

**Path Parameters:**
- `requestId` (required): ID of the processing request

**Response:**
```json
{
  "requestId": "proc_1234567890",
  "status": "processing",
  "progress": 65,
  "videoId": "dQw4w9WgXcQ",
  "statusMessage": "Generating summary"
}
```

**Status Values:**
- `processing`: Request is being processed
- `completed`: Processing completed successfully
- `failed`: Processing failed

**Error Responses:**
- `400 Bad Request`: Missing request ID
- `404 Not Found`: Request not found
- `500 Internal Server Error`: Server-side error

### 4. Get Summary

Retrieves a generated summary by ID.

**Endpoint:** `GET /summaries/:summaryId`

**Path Parameters:**
- `summaryId` (required): ID of the summary

**Response:**
```json
{
  "summaryId": "sum_1234567890",
  "videoId": "dQw4w9WgXcQ",
  "videoMetadata": {
    "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    "channel": "Rick Astley",
    "duration": "3:33",
    "publishDate": "2009-10-25",
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
    "brief": "This iconic 1987 music video features Rick Astley performing his hit song 'Never Gonna Give You Up', which later became an internet meme known as 'Rickrolling'.",
    "chapters": [
      {
        "title": "Introduction",
        "timestamp": "00:00",
        "content": "The video opens with Rick Astley in a trench coat against a brick wall, before launching into the chorus.",
        "keyPoints": ["Establishes the visual aesthetic of the 1980s music video"],
        "bulletPoints": [
          {"text": "Rick appears in a trench coat", "timestamp": "00:03"},
          {"text": "Backup dancers appear throughout the video", "timestamp": "00:15"}
        ],
        "quotes": ["Never gonna give you up, never gonna let you down"]
      }
    ],
    "keyInsights": [
      "The song reached #1 in 25 countries upon its release in 1987",
      "The music video's distinctive dance moves became iconic",
      "The song experienced a resurgence as an internet prank called 'Rickrolling' starting in 2007"
    ],
    "technicalTerms": [
      {"term": "Rickrolling", "definition": "An internet prank involving the unexpected appearance of this music video"}
    ]
  },
  "socialShareable": {
    "twitter": "Just watched Rick Astley's 'Never Gonna Give You Up' - the iconic 1987 hit that launched a thousand memes. The song reached #1 in 25 countries and later became the internet's favorite bait-and-switch prank. #Rickrolling #MusicHistory",
    "linkedin": "ANALYSIS: Rick Astley's 'Never Gonna Give You Up' (1987)\n\nThis iconic track demonstrates the longevity of well-crafted pop music, reaching #1 in 25 countries upon release and finding new life as an internet phenomenon decades later. The video's distinctive visual style and choreography have made it instantly recognizable across generations. #MusicBusiness #DigitalCulture"
  },
  "createdAt": "2025-05-22T15:30:45.123Z"
}
```

**Error Responses:**
- `400 Bad Request`: Missing summary ID
- `404 Not Found`: Summary not found
- `500 Internal Server Error`: Server-side error

### 5. Regenerate Summary

Regenerates a summary with new settings.

**Endpoint:** `PUT /summaries/:summaryId/regenerate`

**Path Parameters:**
- `summaryId` (required): ID of the summary to regenerate

**Request Body:**
```json
{
  "settings": {
    "length": 4,
    "detailLevel": "comprehensive",
    "includeTimestamps": true,
    "generateChapters": true,
    "tone": "academic",
    "complexity": 4,
    "audience": "student"
  }
}
```

**Response:**
```json
{
  "requestId": "proc_0987654321",
  "status": "processing",
  "estimatedTime": 40,
  "videoId": "dQw4w9WgXcQ",
  "originalSummaryId": "sum_1234567890"
}
```

**Error Responses:**
- `400 Bad Request`: Missing summary ID or settings
- `404 Not Found`: Summary not found
- `500 Internal Server Error`: Server-side error

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

**Common Error Codes:**
- `MISSING_URL`: YouTube URL is required
- `INVALID_URL`: Invalid YouTube URL provided
- `VIDEO_NOT_FOUND`: Video not found or not accessible
- `MISSING_REQUEST_ID`: Request ID is required
- `REQUEST_NOT_FOUND`: Processing request not found
- `MISSING_SUMMARY_ID`: Summary ID is required
- `SUMMARY_NOT_FOUND`: Summary not found
- `MISSING_SETTINGS`: Settings are required for regeneration
- `PROCESSING_ERROR`: Error during video processing
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Unexpected server error

## Example Usage

### Using cURL

```bash
# Validate a YouTube URL
curl -G "http://localhost:12000/api/videos/validate" --data-urlencode "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Process a video
curl -X POST "http://localhost:12000/api/videos/process" \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","settings":{"length":3,"detailLevel":"standard","includeTimestamps":true,"generateChapters":true,"tone":"casual","complexity":3,"audience":"general"}}'

# Check processing status
curl "http://localhost:12000/api/videos/status/proc_1234567890"

# Get summary
curl "http://localhost:12000/api/summaries/sum_1234567890"

# Regenerate summary
curl -X PUT "http://localhost:12000/api/summaries/sum_1234567890/regenerate" \
  -H "Content-Type: application/json" \
  -d '{"settings":{"length":4,"detailLevel":"comprehensive","includeTimestamps":true,"generateChapters":true,"tone":"academic","complexity":4,"audience":"student"}}'
```

### Using JavaScript (Fetch API)

```javascript
// Process a video
async function processVideo() {
  const response = await fetch('http://localhost:12000/api/videos/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      settings: {
        length: 3,
        detailLevel: 'standard',
        includeTimestamps: true,
        generateChapters: true,
        tone: 'casual',
        complexity: 3,
        audience: 'general'
      }
    })
  });
  
  const data = await response.json();
  console.log('Processing initiated:', data);
  return data.requestId;
}

// Poll for completion
async function pollForCompletion(requestId) {
  let completed = false;
  
  while (!completed) {
    const response = await fetch(`http://localhost:12000/api/videos/status/${requestId}`);
    const status = await response.json();
    
    console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
    
    if (status.status === 'completed') {
      completed = true;
      return status.summaryId;
    } else if (status.status === 'failed') {
      throw new Error(`Processing failed: ${status.errorMessage}`);
    }
    
    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// Get summary
async function getSummary(summaryId) {
  const response = await fetch(`http://localhost:12000/api/summaries/${summaryId}`);
  const summary = await response.json();
  console.log('Summary retrieved:', summary);
  return summary;
}

// Example usage
async function example() {
  try {
    const requestId = await processVideo();
    const summaryId = await pollForCompletion(requestId);
    const summary = await getSummary(summaryId);
    
    // Display summary to user
    document.getElementById('summary-container').innerHTML = `
      <h2>${summary.videoMetadata.title}</h2>
      <p>${summary.summary.brief}</p>
      <!-- Display more summary content -->
    `;
  } catch (error) {
    console.error('Error:', error);
  }
}

example();
```