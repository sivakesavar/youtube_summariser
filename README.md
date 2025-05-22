# YouTube Video Summarizer

A powerful web application that uses Large Language Models (LLMs) to generate comprehensive, customizable summaries of YouTube videos.

## Overview

This application provides an intuitive interface for users to summarize YouTube videos using advanced LLM technology. It extracts video transcripts, processes them through OpenRouter's LLM API, and presents structured, interactive summaries with customizable options.

## Features

- **Intuitive URL Input**: Easily paste YouTube video URLs to generate summaries
- **Customizable Summaries**: Control length, detail level, tone, and complexity
- **Interactive Timestamps**: Click on timestamps to jump to specific video segments
- **Chapter Breakdowns**: Automatically generated chapter structure with key points
- **Social Media Integration**: Generate optimized snippets for Twitter and LinkedIn
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Accessibility Features**: Designed with accessibility in mind for all users

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **LLM Integration**: OpenRouter API (OpenAI-compatible)
- **Video Processing**: YouTube API, youtube-transcript
- **Styling**: Custom CSS with responsive design

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- OpenRouter API key (or other OpenAI-compatible API)
- (Optional) YouTube API key for enhanced metadata

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/youtube-summarizer.git
   cd youtube-summarizer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   PORT=12000
   NODE_ENV=development
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_API_URL=https://openrouter.ai/api/v1
   DEFAULT_MODEL=openai/gpt-3.5-turbo
   YOUTUBE_API_KEY=your_youtube_api_key (optional)
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:12000`

## Usage

1. Enter a YouTube URL in the input field
2. Customize summary settings if desired
3. Click "Summarize" to process the video
4. View the generated summary with chapters, key insights, and technical terms
5. Click on timestamps to navigate to specific parts of the video
6. Export or share the summary as needed

## Architecture

The application follows a client-server architecture:

1. **Frontend**: Handles user interactions, video display, and summary presentation
2. **Backend API**: Processes requests, extracts video transcripts, and communicates with LLM services
3. **LLM Processing**: Generates summaries based on transcripts and user preferences

## API Endpoints

- `POST /api/videos/process`: Process a YouTube video URL
- `GET /api/videos/status/:requestId`: Get processing status
- `GET /api/summaries/:summaryId`: Get a generated summary
- `PUT /api/summaries/:summaryId/regenerate`: Regenerate a summary with new settings
- `GET /api/videos/validate`: Validate a YouTube URL

## Customization Options

- **Length**: Control summary length (1-5 scale from concise to comprehensive)
- **Detail Level**: Choose between key points, standard, comprehensive, or technical
- **Timestamps**: Include or exclude timestamps in the summary
- **Chapters**: Generate logical chapter divisions
- **Tone**: Select casual, formal, academic, or technical tone
- **Complexity**: Adjust language complexity (1-5 scale)
- **Audience**: Target general, student, professional, or expert audience

## LLM Processing Pipeline

The core of the application is the LLM processing pipeline that transforms video transcripts into structured summaries:

1. **Transcript Extraction**: Extract transcript from YouTube video
2. **Metadata Enhancement**: Combine transcript with video metadata
3. **Prompt Construction**: Generate prompts based on user settings
4. **LLM Processing**: Send prompts to OpenRouter API for processing
5. **Response Formatting**: Structure the LLM response into a user-friendly format
6. **Social Snippet Generation**: Create shareable snippets for social media

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenRouter for providing LLM API access
- YouTube API for video metadata and transcript access
- All contributors to the open-source libraries used in this project