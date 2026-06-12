import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    const fallbackDateIst = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
    });
    const requestedDate = request.nextUrl.searchParams.get('date') ?? fallbackDateIst;
    const requestedDatabase = request.nextUrl.searchParams.get('database') ?? 'both';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return NextResponse.json({ error: 'Date must use YYYY-MM-DD format.' }, { status: 400 });
    }

    if (!['main', 'health', 'both'].includes(requestedDatabase)) {
      return NextResponse.json({ error: 'Database must be main, health, or both.' }, { status: 400 });
    }

    const upstream = new URL('api/comments/relevant-questions', normalizedBaseUrl);
    upstream.searchParams.set('date', requestedDate);
    upstream.searchParams.set('database', requestedDatabase);
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
