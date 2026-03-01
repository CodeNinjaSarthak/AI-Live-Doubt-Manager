# Frontend Components

> Purpose: Every component — what it renders, what data/WS events it consumes, and critical quirks.

<!-- Populate from: frontend/src/components/, frontend/src/pages/ -->

## Pages

### LandingPage
`frontend/src/pages/LandingPage.jsx`
- **Renders:** Marketing/landing content, links to login/register
- **Data:** None

### LoginPage
`frontend/src/pages/LoginPage.jsx`
- **Renders:** Login form
- **Data:** `AuthContext.login()`

### RegisterPage
`frontend/src/pages/RegisterPage.jsx`
- **Renders:** Registration form
- **Data:** `AuthContext.register()`

### DashboardPage
`frontend/src/pages/DashboardPage.jsx`
- **Renders:** Full teacher dashboard; composes all dashboard sub-components
- **Data:** Session list, WebSocket connection
- **Notes:** <!-- any page-level state management notes -->

### SettingsPage
`frontend/src/pages/SettingsPage.jsx`
- **Renders:** Profile settings, password change
- **Data:** `updateProfile()`, `changePassword()` from API service

---

## Dashboard Components

### SessionList
`frontend/src/components/Dashboard/SessionList.jsx`
- **Renders:** List of teacher's sessions with "Switch Session" button
- **Data:** `GET /api/v1/sessions`
- **Critical quirks:** <!-- any known issues or non-obvious behavior -->

### YouTubePanel
`frontend/src/components/Dashboard/YouTubePanel.jsx`
- **Renders:** YouTube connection status, OAuth connect button, video ID input
- **Data:** YouTube auth status, OAuth URL
- **Events:** Opens OAuth popup; listens for `postMessage` from callback

### ManualInput
`frontend/src/components/Dashboard/ManualInput.jsx`
- **Renders:** Text input for manually submitting a question
- **Data:** `submitManualQuestion()` → `POST /api/v1/dashboard/sessions/{id}/question`
- **Critical quirks:** Uses dashboard route, not a generic comments route

### MetricsCards
`frontend/src/components/Dashboard/MetricsCards.jsx`
- **Renders:** Stats cards (total questions, clusters, answers, posted)
- **Data:** `GET /api/v1/dashboard/sessions/{session_id}/stats`
- **Critical quirks:** Uses per-session stats endpoint, NOT a global metrics endpoint

### QuestionsFeed
`frontend/src/components/Dashboard/QuestionsFeed.jsx`
- **Renders:** Real-time feed of classified questions
- **Data:** Initial load + `comment_received`, `comment_classified` WS events
- **Events:** `comment_received`, `comment_classified`

### ClustersPanel
`frontend/src/components/Dashboard/ClustersPanel.jsx`
- **Renders:** Clusters with associated questions and generated answers
- **Data:** `cluster_created`, `cluster_updated`, `answer_generated` WS events
- **Events:** `cluster_created`, `cluster_updated`, `answer_generated`, `answer_posted`

### ActivityLog
`frontend/src/components/Dashboard/ActivityLog.jsx`
- **Renders:** <!-- describe -->
- **Data:** <!-- describe -->

### AnalyticsPanel
`frontend/src/components/Dashboard/AnalyticsPanel.jsx`
- **Renders:** <!-- describe -->
- **Data:** <!-- describe -->

---

## Auth / Layout Components

<!-- Document AuthGuard, NavBar, etc. if they exist -->

---

## WebSocket Event → Component Mapping

| Event | Consumed by |
|-------|-------------|
| `comment_received` | QuestionsFeed |
| `comment_classified` | QuestionsFeed |
| `cluster_created` | ClustersPanel |
| `cluster_updated` | ClustersPanel |
| `answer_generated` | ClustersPanel |
| `answer_posted` | ClustersPanel, MetricsCards |

For full event payload shapes, see [api/websocket-events.md](../api/websocket-events.md).
