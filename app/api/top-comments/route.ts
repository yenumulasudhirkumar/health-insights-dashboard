import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.HEALTH_INSIGHTS_API_BASE_URL;
  const apiKey = process.env.HEALTH_INSIGHTS_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: 'Health Insights API is not configured.' },
      { status: 500 }
    );
  }

  try {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const yesterdayIst = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
    });
    const upstream = new URL('api/comments/relevant-questions', normalizedBaseUrl);
    upstream.searchParams.set('date', yesterdayIst);
    upstream.searchParams.set('database', 'main');
    upstream.searchParams.set('limit', '50');

    const response = await fetch(upstream, {
      headers: {
        'X-Insights-Api-Key': apiKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Health Insights API responded with ${response.status}.` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json({ data: payload.items ?? payload.data?.items ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load health insights from the backend API.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
