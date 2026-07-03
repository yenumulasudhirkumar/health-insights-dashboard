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

- `GET /api/top-comments?date=YYYY-MM-DD&feed=questions&database=both&language=all` proxies the backend relevant-health-question endpoint.
- `GET /api/top-comments?date=YYYY-MM-DD&feed=signals&database=both&language=all&minScore=6` proxies the backend patient-signal endpoint.
- `POST /api/top-comments` proxies selected comments to the backend curation endpoint.

The dashboard `View` dropdown supports:

- Top questions
- Symptom / treatment signals

Saved comments use `intendedUse: question_candidate` for Top questions and `intendedUse: patient_signal` for Symptom / treatment signals.
The signals feed displays the rules-based classifier score and matched rule groups so strong drug-safety and patient-experience comments are easier to review.

The dashboard supports language filtering for:

- all
- English
- Hindi
- Telugu
- mixed
- unknown

## Vercel deployment

Push this project to your repository and configure the environment variables in Vercel:

- `HEALTH_INSIGHTS_API_BASE_URL`
- `HEALTH_INSIGHTS_API_KEY`
