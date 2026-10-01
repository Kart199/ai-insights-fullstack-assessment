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
├── backend/
│   ├── app/
│   │   ├── main.py        # app, CORS, router, error handlers
│   │   ├── errors.py      # ApiError + flat {error, message} handlers
│   │   ├── routes.py      # POST /api/insights
│   │   ├── schemas.py     # request model, supported languages
│   │   └── services.py    # dummy AI service
│   ├── tests/
│   ├── requirements.txt
│   └── requirements-dev.txt
└── frontend/src/
    ├── api/insightsApi.ts            # RTK Query endpoint (API logic only)
    ├── app/                          # store + typed hooks
    ├── components/
    │   ├── PromptForm.tsx            # form + validation + submit
    │   ├── ResultsSection.tsx        # error / clarification / results / load more
    │   ├── ResultsList.tsx           # search + sort (memoized)
    │   └── InsightCard.tsx           # memoized card
    ├── constants/languages.ts        # single source for language options
    ├── features/insights/            # slice: request, results, pagination, error
    ├── features/prompt/promptSchema.ts
    ├── hooks/useDebounce.ts
    └── types/insight.ts
```

## Features

### Prompt Submission

Users can provide:

* Prompt
* Target language

The frontend validates the form with Zod (language is an enum of the
supported codes) and keeps the Submit button disabled until the input is valid.

### Backend Validation

The FastAPI API validates:

* Empty prompts
* Unsupported languages
* Prompt length/context

Every 4xx (including malformed bodies, invalid `contextId` and invalid
`page`/`pageSize`) returns the same flat shape, never FastAPI's default
`detail` wrapper:

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

Components are split by responsibility (`PromptForm`, `ResultsSection`,
`ResultsList`, `InsightCard`); `ResultsList` and `InsightCard` are wrapped in
`React.memo`, so typing in the prompt box does not re-render the results.

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

Create/activate a virtual environment and install dependencies:

```bash
pip install -r requirements.txt        # runtime
pip install -r requirements-dev.txt    # + tests
pytest
```

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
npm test
```

The API URL defaults to `http://localhost:8000/api`; override with
`VITE_API_URL` (see `.env.example`).

Frontend:

```text
http://localhost:5173
```

## Architectural Decisions

### Why RTK Query?

RTK Query owns the API layer (base URL, request shaping, lifecycle actions),
keeping network logic out of components.

The endpoint is a **mutation**, not a query: it is a `POST` to an AI service
where each call can be non-idempotent and the response is a conversation step,
so RTK Query's argument-keyed cache is not a good fit. Results, pagination,
loading and error state are instead kept in the `insights` slice, which listens
to the endpoint's `pending/fulfilled/rejected` actions. The slice also drops
stale responses (e.g. a "Load more" that returns after a new prompt was
submitted).

"Load more" always paginates the request stored in Redux, not the current form
contents.

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
| TypeScript (brief says JavaScript; TS is a superset) | Completed |
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
