# AI Insights — Full Stack Assessment

A full-stack AI Insights application built as part of a Senior Digital Full Stack Developer assessment.

The application allows users to submit a prompt and target language, receive AI-generated insights through a backend-for-frontend (BFF) API, and interact with the results through pagination, search, and sorting.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Redux Toolkit
* RTK Query
* Zod
* CSS

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

## Architecture

```text
┌──────────────────────┐
│      React UI        │
│                      │
│ PromptForm           │
│ ResultsList          │
└──────────┬───────────┘
           │
           │ RTK Query
           ▼
┌──────────────────────┐
│     FastAPI BFF      │
│                      │
│ Validation            │
│ Business rules        │
│ Pagination            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Dummy AI Service    │
│                      │
│ Local mock insights  │
└──────────────────────┘
```

## Project Structure

```text
ai-insights-fullstack-assessment/
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── routes.py
│       ├── schemas.py
│       └── services.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── insightsApi.ts
│   │   │
│   │   ├── app/
│   │   │   └── store.ts
│   │   │
│   │   ├── components/
│   │   │   ├── PromptForm.tsx
│   │   │   └── ResultsList.tsx
│   │   │
│   │   ├── features/
│   │   │   ├── insights/
│   │   │   │   └── insightsSlice.ts
│   │   │   └── prompt/
│   │   │       └── promptSchema.ts
│   │   │
│   │   ├── hooks/
│   │   │   └── useDebounce.ts
│   │   │
│   │   └── types/
│   │       └── insight.ts
│   │
│   └── package.json
│
└── README.md
```

## Features

### Prompt Submission

Users can provide:

* Prompt
* Target language

The frontend validates the form using Zod before submission.

### Backend Validation

The FastAPI API validates:

* Empty prompts
* Unsupported languages
* Prompt length/context

Invalid language requests return structured errors.

Example:

```json
{
  "error": "INVALID_LANGUAGE",
  "message": "Target language is not supported"
}
```

### Clarification Handling

Short prompts are handled before calling the downstream AI service.

Example:

```json
{
  "status": "NEEDS_CLARIFICATION",
  "message": "Please provide more details",
  "insights": []
}
```

This prevents unnecessary downstream processing.

### Pagination

The backend implements pagination using:

```text
page
pageSize
```

The API returns pagination metadata:

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 15,
  "hasNext": true
}
```

The frontend uses a **Load More** interaction and appends subsequent results.

### Search

Search is performed client-side against:

* Insight title
* Insight text
* Category
* Source

### Debounced Search

Search input is debounced by 300ms to avoid unnecessary filtering operations while the user is typing.

### Sorting

Results can be sorted:

* A-Z
* Z-A

### Performance

`useMemo` is used for filtering and sorting so derived results are recalculated only when the relevant inputs change.

RTK Query provides:

* Request lifecycle handling
* Loading states
* Error states
* Server-state caching

## API

### POST `/api/insights`

Request:

```json
{
  "prompt": "Explain customer retention strategies",
  "targetLanguage": "en"
}
```

Optional:

```json
{
  "contextId": "00000000-0000-0000-0000-000000000000"
}
```

Pagination parameters:

```text
?page=1&pageSize=10
```

Successful response:

```json
{
  "status": "SUCCESS",
  "insights": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 15,
    "hasNext": true
  }
}
```

## Running Locally

### Backend

Navigate to:

```text
backend/
```

Create/activate the virtual environment and install dependencies.

Run:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

### Frontend

Navigate to:

```text
frontend/
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Architectural Decisions

### Why RTK Query?

RTK Query was chosen to manage server state and API lifecycle while providing caching, loading, and error handling.

It also keeps API logic separate from UI components.

### Why backend pagination?

Pagination is handled by the backend so that potentially large result sets do not need to be transferred to the client in a single response.

This reduces network payload and frontend memory usage.

### Why client-side search?

The assessment specifically requires client-side search. The frontend filters the currently loaded results without making additional API requests.

### Why a BFF?

The FastAPI layer acts as a Backend-for-Frontend between the React application and the downstream AI service.

This provides a central place for:

* Validation
* Business rules
* API contracts
* Error handling
* Pagination
* Future authentication/security controls

The dummy AI service can later be replaced with a real LLM integration without requiring major frontend changes.



## Assessment Coverage

| Requirement              | Status    |
| ------------------------ | --------- |
| React frontend           | Completed |
| TypeScript               | Completed |
| Form validation          | Completed |
| Prompt submission        | Completed |
| Target language          | Completed |
| FastAPI BFF              | Completed |
| Backend validation       | Completed |
| Clarification state      | Completed |
| Structured errors        | Completed |
| Pagination               | Completed |
| Load More                | Completed |
| Client-side search       | Completed |
| Debounced search         | Completed |
| Sorting                  | Completed |
| RTK Query                | Completed |
| Redux global state       | Completed |
| Performance optimization | Completed |
| Responsive UI            | Completed |
