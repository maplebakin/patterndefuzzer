# Pattern Defuzzing Tool — MVP

Monorepo with `frontend` (React + Vite) and `backend` (Express + Puppeteer).
Scrapes supported crochet sites and returns a standardized JSON you can render cleanly.

## Quick Start

```bash
npm install
npm run dev
```

- Frontend dev server: http://localhost:5173
- Backend dev server:  http://localhost:5000
- API endpoint:        POST http://localhost:5000/api/patterns/scrape  { url: "https://..." }

### Production
```bash
npm run build
npm start
```
Backend will serve the built frontend from `/frontend/dist` when `NODE_ENV=production`.
