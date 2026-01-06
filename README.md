# Vertex Server

## Overview

Vertex Server is a Node.js/Express backend API that generates prerequisite knowledge concept maps using Google's Gemini AI. It validates API responses against strict schemas, implements retry logic for resilience, and enforces rate limiting to protect resources.

## Features

- **AI-Powered Concept Maps** - Generates prerequisite knowledge trees for any concept using Google Gemini API
- **Schema Validation** - Validates all API responses against Zod schemas to ensure data integrity
- **Retry Logic** - Automatic exponential backoff retry mechanism for transient failures
- **Rate Limiting** - Protects API endpoints with configurable rate limits (100 req/15min general, 20 req/hour for AI service)
- **Comprehensive Error Handling** - Custom error classes and middleware for proper HTTP status codes
- **Proxy Support** - Configured to work behind reverse proxies with X-Forwarded-For header support
- **Health Check** - Built-in `/api/health` endpoint to monitor server status
- **Request Logging** - Morgan middleware for incoming and outgoing request logging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **AI Service**: Google Gemini API (`@google/genai`)
- **Schema Validation**: Zod
- **Rate Limiting**: express-rate-limit
- **Testing**: Node's built-in test runner with Sinon for mocking
- **Linting**: ESLint with Stylistic rules
- **Environment**: dotenv for configuration

## Project Structure

```
├── controllers/          # Route handlers
│   ├── dependencyMap.js # Concept map endpoint
│   └── health.js        # Health check endpoint
├── services/            # Business logic
│   ├── aiService.js     # AI service orchestration
│   └── googleGeminiService.js # Gemini API client
├── utils/               # Utilities and middleware
│   ├── config.js        # Environment configuration
│   ├── errors.js        # Custom error classes
│   ├── middleware.js    # Express middleware (error handler, rate limiters)
│   ├── logger.js        # Logging utility
│   ├── validators.js    # Schema validation logic
│   ├── schemas.js       # Zod schema definitions
│   ├── prompt.js        # AI prompt generation
│   └── helpers.js       # Retry logic
├── tests/               # Test suites
│   ├── generate_map_api.test.js
│   ├── health_api.test.js
│   ├── middleware.test.js
│   ├── rate_limit.test.js
│   └── schema_validation.test.js
├── requests/            # REST client files (.rest)
├── app.js              # Express app setup
├── index.js            # Server entry point
└── package.json        # Dependencies
```

## Installation

```bash
# Install dependencies
npm install

# Create .env file with required variables
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

### With Coverage
```bash
npm run test:coverage
```

### Linting
```bash
npm run lint
```

## API Endpoints

### POST `/api/generate-map`
Generates a concept prerequisite map for a given concept.

**Request:**
```json
{
  "concept": "React",
  "level": "intermediate",
  "subject": "Web Development"
}
```

**Query Parameters:**
- `concept` (required): The concept to generate a map for
- `level` (optional): Education level (`foundational`, `intermediate`, `advanced`)
- `subject` (optional): Subject area for context

**Response (200):**
```json
{
  "target": "React",
  "prerequisites": [
    {
      "id": 1,
      "name": "JavaScript",
      "description": "Learn core JavaScript concepts",
      "prerequisites": [],
      "level": "foundational"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Missing required field
- `502 Bad Gateway` - Invalid API response or JSON parsing error
- `503 Service Unavailable` - AI service unavailable after retries
- `429 Too Many Requests` - Rate limit exceeded (20 requests/hour)

### GET `/api/health`
Health check endpoint.

**Response (200):**
```json
{
  "status": "UP",
  "timestamp": "2024-01-05T20:27:37.000Z",
  "uptime": 1234.56
}
```

## Error Handling

The server implements a comprehensive error handling strategy:

| Error Type | Status | Handler |
|-----------|--------|---------|
| `BadRequestError` | 400 | Validation errors (missing fields) |
| `BadResponseError` | 502 | Invalid API response, JSON parse errors |
| `ApiError` | 503 | External API failures |
| Rate limit exceeded | 429 | Rate limiter middleware |
| Unknown endpoint | 404 | 404 handler middleware |

## Validation

All AI concept map responses are validated against this schema:

```javascript
{
  target: string (required, non-empty),
  prerequisites: [
    {
      id: positive integer (required),
      name: string (required, non-empty),
      description: string (required, non-empty),
      prerequisites: number[] (array of prerequisite IDs),
      level: 'foundational' | 'intermediate' | 'advanced' (required)
    }
  ] (required, at least 1 item)
}
```

Additional validation ensures all prerequisite IDs referenced actually exist in the tree.

## Retry Logic

The `retryWithBackoff` helper automatically retries requests on transient failures:

- **Max Retries**: 2 (3 total attempts)
- **Backoff Strategy**: Exponential (1s → 2s → 4s)
- **Retryable Errors**: Timeout, connection refused
- **Non-Retryable**: Validation errors, syntax errors

## Rate Limiting

Two rate limiters protect the API:

1. **General API** (`apiLimiter`)
   - Limit: 100 requests per 15 minutes
   - Applies to: All routes globally

2. **AI Service** (`aiServiceLimiter`)
   - Limit: 20 requests per hour
   - Applies to: `/api/generate-map` only
   - Counts: Failed requests only (successful requests don't count)

## Configuration

Environment variables (`.env`):

```env
# Required
GEMINI_API_KEY=...

# Optional
PORT=3001 (default: 3001)
```

## Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/generate_map_api.test.js

# Run with coverage
npm run test:coverage
```

**Test Coverage:**
- ✅ Schema validation (valid/invalid responses)
- ✅ Error handling (400, 502, 503, 429 status codes)
- ✅ Retry logic (timeout recovery, max retries)
- ✅ Rate limiting (IP-based, per-endpoint)
- ✅ Prompt generation (concept, level, subject parameters)
- ✅ API integration

## Deployment

### Render.com

1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard:
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
3. Build command: `npm install`
4. Start command: `npm start`

## Logging

Logs are output to console (except in test environment):

- **Info**: `logger.info()` - General information, retry attempts
- **Error**: `logger.error()` - Error details and stack traces

## ESLint Configuration

The project enforces strict code style rules:

- Single quotes
- No semicolons
- 2-space indentation
- Unix line endings
- Strict equality (`===`)
- No unused variables (except `_` prefixed)
- Proper spacing around arrows and objects

## Related Projects

- [Vertex Frontend](https://github.com/sthDINESH/Vertex) - React frontend consuming this API
