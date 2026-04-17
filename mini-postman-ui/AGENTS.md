<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Mini Postman Clone – Project Specification

## 🎯 Goal

Build a full-featured API testing tool (similar to Postman) with:
* **Backend**: Django + Django REST Framework
* **Frontend**: Next.js 16 (React) with TypeScript
* **UI**: Clean, modern, and highly usable with shadcn/ui + Tailwind CSS

---

## 🏗️ Project Structure

```
miniPosman/
├── api_tool/              # Django Backend
│   ├── api_tool/          # Django project settings
│   ├── core/              # Main app (models, views, urls)
│   └── manage.py
├── mini-postman-ui/       # Next.js Frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components (to be created)
│   ├── lib/              # Utilities, API client
│   └── package.json
└── AGENTS.md             # This file
```

---

## ⚙️ Backend (Django)

### Current State (As of 2025-04-17)

#### ✅ Implemented
- **RequestLog model** - Stores request history (method, url, headers, body, status_code, response_body)
- **SendRequest endpoint** (`POST /api/send/`) - Proxies HTTP requests
- **RequestHistory endpoint** (`GET /api/history/`) - Returns last 50 requests
- **Header filtering** - Strips forbidden headers (transfer-encoding, content-encoding, connection)
- **Error handling** - Basic try/catch with 500 responses

#### ⚠️ Issues Found
1. **Migration mismatch**: Migration has `Request` model, `models.py` has `RequestLog`
2. **Missing field**: `response_headers` used in views.py but not in model
3. **No CORS**: Frontend cannot communicate with backend
4. **No serializers**: Raw model data returned

#### ❌ Missing Features
- [ ] CORS configuration
- [ ] Response headers storage (model field missing)
- [ ] Serializers for consistent API responses
- [ ] Authentication/Authorization
- [ ] Collection model
- [ ] SavedRequest model
- [ ] Request filtering/search
- [ ] Pagination
- [ ] Unit tests

---

## 🎨 Frontend (Next.js)

### Current State (As of 2025-04-17)

#### Tech Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **React**: 19.2.4
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans, Geist Mono
- **HTTP Client**: axios 1.15.0
- **UI Library**: ❌ Not installed yet (needs shadcn/ui)

#### ✅ Implemented (Basic)
- Single page layout with sidebar + main panel
- URL input field
- HTTP method selector (GET, POST, PUT, DELETE)
- Send button with axios integration
- Request history sidebar (clickable to reload URL)
- Basic response display (raw JSON)

#### ❌ Missing Features (Critical)
| Feature | Priority | Status |
|---------|----------|--------|
| shadcn/ui components | High | Not installed |
| Request Body editor | High | Missing - can't do POST/PUT properly |
| Headers editor | High | Missing - no auth/content-type support |
| Query params editor | Medium | Missing |
| JSON syntax highlighting | Medium | Missing - raw output only |
| Status code colors | Medium | Missing |
| Response time/size metrics | Medium | Missing |
| Collections sidebar | Low | Missing |
| State management (Zustand) | Medium | Missing - only local state |

---

## 🔧 Implementation Phases

### Phase 1: Critical Fixes (Current)
- [ ] Fix Django RequestLog model (add response_headers field)
- [ ] Create migration for model changes
- [ ] Add CORS configuration to Django
- [ ] Install shadcn/ui in frontend
- [ ] Build Request Body editor
- [ ] Build Headers editor
- [ ] Update page.tsx integration

### Phase 2: Enhanced UI
- [ ] Add JSON syntax highlighting
- [ ] Status code color coding
- [ ] Response metrics (time, size)
- [ ] Copy-to-clipboard buttons
- [ ] Loading indicators

### Phase 3: Collections & State
- [ ] Collection model & API
- [ ] SavedRequest model & API
- [ ] Collections sidebar UI
- [ ] Global state management (Zustand)

### Phase 4: Advanced Features
- [ ] Environment variables ({{base_url}})
- [ ] Query params editor
- [ ] Request authentication UI
- [ ] Import/export collections

---

## 📋 API Specification

### Endpoints

#### POST /api/send/
Executes external HTTP requests.

**Request Body:**
```json
{
  "url": "string",
  "method": "GET | POST | PUT | DELETE | PATCH",
  "headers": { "key": "value" },
  "body": {}
}
```

**Response:**
```json
{
  "status": number,
  "headers": { "key": "value" },
  "body": object | string
}
```

#### GET /api/history/
Returns last 50 request logs.

**Response:**
```json
[
  {
    "id": number,
    "url": "string",
    "method": "string",
    "status": number,
    "created_at": "datetime"
  }
]
```

---

## 🎯 Success Criteria

The app should:
* Replace basic Postman usage for common scenarios
* Be fast and responsive (< 200ms UI interactions)
* Handle real-world APIs (JSON, text, error responses)
* Provide clean developer experience with syntax highlighting
* Support all major HTTP methods with proper body/header handling

---

## 🚀 Development Commands

### Backend
```bash
cd /mnt/c/Users/User/Desktop/projects/miniPosman/api_tool
python manage.py runserver  # Start Django server on :8000
python manage.py makemigrations
python manage.py migrate
```

### Frontend
```bash
cd /mnt/c/Users/User/Desktop/projects/miniPosman/mini-postman-ui
npm run dev  # Start Next.js on :3000
```

---

## 📝 Notes for AI Agents

1. **Always check this file first** before making changes
2. **Update this file** when completing features
3. **Follow existing patterns** in the codebase
4. **Never suppress TypeScript errors** with `as any` or `@ts-ignore`
5. **Use shadcn/ui components** when available (install if missing)
6. **Match Tailwind v4 patterns** - uses CSS variables, not tailwind.config.ts
7. **Run diagnostics** after file changes
8. **Test backend integration** - ensure frontend can reach :8000

---

*Last Updated: 2025-04-17*
*Phase: 1 (Critical Fixes In Progress)*
