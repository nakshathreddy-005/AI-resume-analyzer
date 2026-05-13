# 🤖 AI-Powered Resume Analyzer

> **Technical Documentation & Developer Guide**
> Full-Stack AI Application — React + Node.js + MongoDB + OpenAI / Gemini

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Features](#2-core-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [REST API Reference](#6-rest-api-reference)
7. [Authentication Flow](#7-authentication-flow)
8. [AI Integration](#8-ai-integration)
9. [Environment Variables](#9-environment-variables)
10. [Security Considerations](#10-security-considerations)
11. [Deployment Guide](#11-deployment-guide)
12. [Error Code Reference](#12-error-code-reference)
13. [Changelog](#13-changelog)

---

## 1. Project Overview

The AI-Powered Resume Analyzer is a full-stack SaaS application that leverages large language models to help job seekers optimize their resumes. The platform parses uploaded resumes, calculates Applicant Tracking System (ATS) compatibility scores, generates targeted improvement suggestions, and benchmarks candidates against specific job roles.

This document covers the complete architecture, API contracts, database schema, authentication flow, AI integration, and deployment strategy for the application.

---

## 2. Core Features

### 2.1 User Authentication

The authentication system implements a secure dual-token strategy using short-lived JWT access tokens paired with long-lived refresh tokens stored as HTTP-only cookies, preventing XSS-based token theft.

- **Access Tokens:** JWT access tokens with 15-minute expiry
- **Refresh Tokens:** Refresh tokens (7-day expiry) stored as HTTP-only cookies
- **Password Security:** Passwords hashed with bcrypt (12 salt rounds)
- **Email Verification:** Email verification on registration
- **OAuth Integration:** OAuth 2.0 support for Google and LinkedIn

### 2.2 Resume Upload & Parsing

Users can upload resumes in PDF or DOCX format. Files are validated, stored on Cloudinary or AWS S3, and parsed using a combination of text extraction libraries and AI-assisted field identification.

- Supported formats: PDF (`.pdf`), Microsoft Word (`.doc`, `.docx`)
- Maximum file size: 5MB per upload
- Fields extracted: Contact info, Summary, Work Experience, Education, Skills, Certifications, Projects
- Fallback to AI parsing for non-standard or heavily styled resume layouts

### 2.3 ATS Score Calculation

The ATS scoring engine evaluates resumes against common Applicant Tracking System criteria. Scores are computed across five weighted dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Keyword Match | 30% | Match rate of job-description keywords found in resume |
| Formatting | 20% | Compatibility with ATS parsers — avoids tables and images |
| Section Completeness | 20% | Presence of all standard sections |
| Quantifiable Achievements | 15% | Usage of metrics and numbers in bullet points |
| Action Verbs | 15% | Use of strong action verbs to lead every bullet point |

### 2.4 AI Suggestions Engine

The suggestions engine sends the parsed resume JSON and target job description to the configured LLM (OpenAI GPT-4o or Google Gemini 1.5 Pro). The model returns structured feedback across five categories:

- **Summary rewrite** — A stronger, role-targeted professional summary
- **Bullet point improvements** — Quantified, action-verb-led achievement statements
- **Missing keywords** — Skills and terms absent from the resume but in the job description
- **Skills gap analysis** — Technical and soft skills the candidate should acquire or highlight
- **Formatting recommendations** — Structural changes to improve ATS readability

### 2.5 Job Role-Based Scoring

Users can specify a target job title or paste a job description URL. The platform fetches the job description (if a URL is provided), extracts requirements, and generates a role-specific compatibility score separate from the generic ATS score. Scores are stored per scan and surfaced on the dashboard.

### 2.6 Resume History Dashboard

Every upload and analysis run is persisted in MongoDB. The dashboard surfaces a timeline of all past scans with scores, deltas between versions, and the ability to compare two resume versions side-by-side with highlighted diffs.

### 2.7 Download Improved Resume

After applying AI suggestions, users can download a regenerated resume as a formatted PDF or DOCX file. The document uses a clean, ATS-safe template with the improved content pre-populated and ready to submit.

---

## 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS 3, React Query, React Hook Form, Zustand |
| Backend | Node.js 20, Express 5, Mongoose ODM |
| Database | MongoDB Atlas (production), MongoDB Community (local dev) |
| AI / LLM | OpenAI GPT-4o API, Google Gemini 1.5 Pro API (configurable) |
| File Storage | Cloudinary (default), AWS S3 (enterprise option) |
| Auth | JSON Web Tokens, bcrypt, Passport.js (OAuth 2.0) |
| Email | Nodemailer + SendGrid SMTP |
| Testing | Jest, React Testing Library, Supertest |
| CI/CD | GitHub Actions, Docker, Vercel (frontend), Railway (backend) |

---

## 4. System Architecture

### 4.1 High-Level Architecture

The system follows a three-tier architecture with a React SPA frontend, a RESTful Express API backend, and MongoDB as the primary datastore. AI processing is offloaded to external LLM APIs via the backend service layer to protect API keys and enforce rate limiting.

```
Client SPA → CDN → API Gateway → Express Services → MongoDB / AI APIs / Object Storage
```

### 4.2 Directory Structure

```
resume-analyzer/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level page components
│       ├── hooks/             # Custom React hooks
│       ├── store/             # Zustand global state
│       ├── services/          # Axios API client functions
│       └── utils/             # Shared helper utilities
├── server/                    # Node.js + Express backend
│   ├── controllers/           # Route handler logic
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/                # Mongoose schema definitions
│   ├── routes/                # Express route definitions
│   ├── services/              # AI, parsing, scoring logic
│   └── utils/                 # Shared utilities
├── docker-compose.yml
└── .env.example
```

---

## 5. Database Schema

### 5.1 User Collection

```js
// users
{
  _id:            ObjectId,
  email:          String (unique, required),
  passwordHash:   String,
  name:           String,
  provider:       'local' | 'google' | 'linkedin',
  providerId:     String,
  isVerified:     Boolean,
  refreshTokens:  [{ token: String, expiresAt: Date }],
  createdAt:      Date,
  updatedAt:      Date
}
```

### 5.2 Resume Collection

```js
// resumes
{
  _id:          ObjectId,
  userId:       ObjectId (ref: 'users'),
  filename:     String,
  fileUrl:      String,          // Cloudinary / S3 signed URL
  fileType:     'pdf' | 'docx',
  parsedData: {
    contact:    { name, email, phone, location, linkedin, github },
    summary:    String,
    experience: [{ company, title, dates, bullets: [String] }],
    education:  [{ institution, degree, field, dates, gpa }],
    skills:     [String],
    projects:   [{ name, description, technologies, url }],
    certifications: [{ name, issuer, date }]
  },
  atsScore:     Number,          // 0–100
  scoringBreakdown: {
    keywordMatch: Number,
    formatting:   Number,
    completeness: Number,
    achievements: Number,
    actionVerbs:  Number
  },
  suggestions:  [{ category, original, improved, priority }],
  jobRole:      String,
  jobScore:     Number,
  version:      Number,
  parentId:     ObjectId,        // reference to previous version
  createdAt:    Date
}
```

---

## 6. REST API Reference

### 6.1 Authentication Endpoints

| Method + Path | Description | Auth Required |
|---------------|-------------|:---:|
| `POST /api/auth/register` | Register new user account | No |
| `POST /api/auth/login` | Login and receive token pair | No |
| `POST /api/auth/refresh` | Refresh access token via cookie | No |
| `POST /api/auth/logout` | Invalidate refresh token | Yes |
| `GET  /api/auth/verify/:token` | Verify email address | No |
| `POST /api/auth/forgot-password` | Send password reset email | No |
| `POST /api/auth/reset-password` | Reset password using token | No |

### 6.2 Resume Endpoints

| Method + Path | Description | Auth Required |
|---------------|-------------|:---:|
| `POST /api/resumes/upload` | Upload and parse a resume file | Yes |
| `GET  /api/resumes` | List all resumes for current user | Yes |
| `GET  /api/resumes/:id` | Get full resume detail + analysis | Yes |
| `POST /api/resumes/:id/analyze` | Re-run ATS analysis on resume | Yes |
| `POST /api/resumes/:id/suggest` | Generate AI improvement suggestions | Yes |
| `POST /api/resumes/:id/job-score` | Score against a target job role | Yes |
| `GET  /api/resumes/:id/download` | Download improved resume file | Yes |
| `DELETE /api/resumes/:id` | Delete resume and associated file | Yes |

### 6.3 Job Scoring Request / Response

```http
POST /api/resumes/:id/job-score
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobTitle":        "Senior Frontend Engineer",
  "jobDescription":  "We are looking for a React expert with 4+ years..."
  // OR supply a URL instead:
  "jobUrl":          "https://jobs.example.com/posting/12345"
}
```

**Response:**
```json
{
  "jobScore":          82,
  "matchedKeywords":   ["React", "TypeScript", "REST APIs"],
  "missingKeywords":   ["GraphQL", "AWS Lambda", "Terraform"],
  "recommendation":    "Strong candidate. Adding GraphQL will increase fit to 90+."
}
```

---

## 7. Authentication Flow

### 7.1 Login & Token Lifecycle

```
1.  POST /api/auth/login  { email, password }
2.  Server runs:  bcrypt.compare(password, user.passwordHash)
3.  On success, generate tokens:
      accessToken  = jwt.sign({ userId }, ACCESS_SECRET,  { expiresIn: '15m' })
      refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })
4.  refreshToken hashed and stored in user.refreshTokens[]
5.  refreshToken sent as HTTP-only Secure SameSite=Strict cookie
6.  accessToken returned in JSON response body
7.  Client stores accessToken in memory only (never localStorage)

Token Refresh:
8.  When accessToken expires, client calls POST /api/auth/refresh
9.  Server reads cookie, validates hash against DB record
10. Issues new accessToken; rotates refresh token (old one invalidated)

Logout:
11. POST /api/auth/logout removes refreshToken from DB
12. Cookie cleared on client
```

---

## 8. AI Integration

### 8.1 Provider Abstraction

Both OpenAI and Gemini are supported via a common `AIService` interface. The provider is selected at runtime via the `AI_PROVIDER` environment variable, allowing zero-code switching between providers.

```js
// server/services/AIService.js
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER; // 'openai' | 'gemini'
  }

  async getSuggestions(parsedResume, jobDescription) {
    const prompt = this.buildPrompt(parsedResume, jobDescription);
    if (this.provider === 'openai') return this.callOpenAI(prompt);
    return this.callGemini(prompt);
  }

  buildPrompt(resume, jd) {
    return `You are an expert resume coach. Return ONLY valid JSON.
            Given this resume: ${JSON.stringify(resume)}
            And this job description: ${jd}
            Return suggestions as: [{category, original, improved, priority}]`;
  }
}
```

### 8.2 OpenAI Configuration

```js
model:           'gpt-4o'
temperature:     0.3          // Low temp for consistent output
max_tokens:      2000
response_format: { type: 'json_object' }
```

> ⚠️ **Important:** Always validate LLM JSON output with a schema validator (e.g. `ajv`) before persisting to MongoDB. Never trust raw model output without validation.

---

## 9. Environment Variables

Copy `.env.example` to `.env` and fill in all values before running the application.

| Variable | Description |
|----------|-------------|
| `PORT` | Express server port (default: `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens (min 32 chars) |
| `AI_PROVIDER` | `'openai'` or `'gemini'` |
| `OPENAI_API_KEY` | OpenAI API key (required if `AI_PROVIDER=openai`) |
| `GEMINI_API_KEY` | Google Gemini API key (required if `AI_PROVIDER=gemini`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file storage |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `AWS_BUCKET_NAME` | S3 bucket name (required if using AWS storage) |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key |
| `SENDGRID_API_KEY` | SendGrid API key for transactional email |
| `CLIENT_URL` | Frontend origin URL for CORS allowlist |
| `NODE_ENV` | `'development'` \| `'production'` \| `'test'` |

---

## 10. Security Considerations

- All file uploads are validated for MIME type and magic bytes before processing
- Resume files are virus-scanned via ClamAV before parsing (production)
- AI prompts include injection guards — resume content is JSON-escaped before insertion
- Rate limiting enforced: 10 uploads/hour per user, 20 AI requests/hour per user
- All Cloudinary and S3 file URLs are signed and expire after 1 hour
- MongoDB queries use parameterized inputs via Mongoose to prevent NoSQL injection
- `Helmet.js` sets all recommended HTTP security headers on every response
- CORS restricted to `CLIENT_URL` origin only; credentials flag required
- Refresh tokens are hashed with bcrypt before storage in MongoDB

---

## 11. Deployment Guide

### 11.1 Quick Start with Docker

```bash
git clone https://github.com/your-org/resume-analyzer.git
cd resume-analyzer
cp .env.example .env    # Fill in all required environment variables

docker-compose up --build

# Services start on:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:5000
#   MongoDB   →  mongodb://localhost:27017
```

### 11.2 Production Deployment

- **Frontend:** Deploy `client/` to Vercel. Set `VITE_API_URL` to your backend URL.
- **Backend:** Deploy `server/` to Railway or Render. Attach MongoDB Atlas connection string.
- Configure custom domain and SSL — handled automatically by Vercel and Railway.
- Set up GitHub Actions CI/CD using the provided `.github/workflows/deploy.yml` file.
- Enable MongoDB Atlas IP allowlist and use a dedicated DB user with minimal permissions.

---

## 12. Error Code Reference

| HTTP Code | Error Code | Meaning |
|:---------:|------------|---------|
| `400` | `INVALID_FILE_TYPE` | Uploaded file is not PDF or DOCX format |
| `400` | `FILE_TOO_LARGE` | File size exceeds the 5MB limit |
| `400` | `PARSE_FAILED` | Resume content could not be extracted or parsed |
| `401` | `TOKEN_EXPIRED` | JWT access token has expired — refresh required |
| `401` | `INVALID_CREDENTIALS` | Email or password is incorrect |
| `401` | `INVALID_REFRESH_TOKEN` | Refresh token is invalid or has been rotated |
| `403` | `EMAIL_NOT_VERIFIED` | User has not verified their email address |
| `404` | `RESUME_NOT_FOUND` | Resume ID not found or not owned by current user |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests — retry after the cooldown window |
| `500` | `AI_SERVICE_ERROR` | LLM API returned an error or request timed out |
| `500` | `STORAGE_ERROR` | File upload to Cloudinary or S3 failed |

---

## 13. Changelog

| Version | Date | Changes |
|---------|------|---------|
| `1.3.0` | 2025-10-01 | Download improved resume as PDF/DOCX, Google & LinkedIn OAuth |
| `1.2.0` | 2025-09-01 | Gemini 2.5 Pro support, resume history diff view |
| `1.1.0` | 2025-08-01 | Job role-based scoring, URL job description fetching |
| `1.0.0` | 2025-07-01 | Initial release: upload, parse, ATS score, AI suggestions |

---

<p align="center">Made with ❤️ using React, Node.js, MongoDB & OpenAI</p>
