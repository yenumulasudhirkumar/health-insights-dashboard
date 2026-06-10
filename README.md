# Health Insights Dashboard

A small Next.js dashboard for reviewing fresh health discussion signals from the Health Insights API.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set the Health Insights API URL and private API key.
3. Install dependencies:
   ```bash
   cd /home/sudhir/workspace/react/health-insights-dashboard
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## API

- `GET /api/top-comments` proxies the backend `GET /api/comments/yesterday` endpoint.

## Vercel deployment

Push this project to your repository and configure the environment variables in Vercel:

- `HEALTH_INSIGHTS_API_BASE_URL`
- `HEALTH_INSIGHTS_API_KEY`
