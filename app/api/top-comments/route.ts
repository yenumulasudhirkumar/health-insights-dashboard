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
    const requestedFeed = request.nextUrl.searchParams.get('feed') ?? 'questions';
    const requestedDatabase = request.nextUrl.searchParams.get('database') ?? 'both';
    const requestedLanguage = request.nextUrl.searchParams.get('language') ?? 'all';
    const requestedSourceMode = request.nextUrl.searchParams.get('sourceMode') ?? 'all';
    const requestedMinScore = request.nextUrl.searchParams.get('minScore') ?? '6';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return NextResponse.json({ error: 'Date must use YYYY-MM-DD format.' }, { status: 400 });
    }

    if (!['main', 'health', 'both'].includes(requestedDatabase)) {
      return NextResponse.json({ error: 'Database must be main, health, or both.' }, { status: 400 });
    }

    if (!['questions', 'signals'].includes(requestedFeed)) {
      return NextResponse.json({ error: 'Feed must be questions or signals.' }, { status: 400 });
    }

    if (!['all', 'channel', 'keyword'].includes(requestedSourceMode)) {
      return NextResponse.json({ error: 'Source mode must be all, channel, or keyword.' }, { status: 400 });
    }

    if (!/^\d+$/.test(requestedMinScore)) {
      return NextResponse.json({ error: 'Minimum score must be a positive integer.' }, { status: 400 });
    }

    if (!['all', 'english', 'hindi', 'telugu', 'mixed', 'unknown'].includes(requestedLanguage)) {
      return NextResponse.json(
        { error: 'Language must be all, english, hindi, telugu, mixed, or unknown.' },
        { status: 400 }
      );
    }

    const upstreamPath =
      requestedFeed === 'signals' ? 'api/comments/patient-signals' : 'api/comments/relevant-questions';
    const upstream = new URL(upstreamPath, normalizedBaseUrl);
    upstream.searchParams.set('date', requestedDate);
    upstream.searchParams.set('database', requestedDatabase);
    upstream.searchParams.set('language', requestedLanguage);
    upstream.searchParams.set('sourceMode', requestedSourceMode);
    upstream.searchParams.set('limit', '50');
    if (requestedFeed === 'signals') {
      upstream.searchParams.set('minScore', requestedMinScore);
    }

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

export async function POST(request: NextRequest) {
  const baseUrl = process.env.HEALTH_INSIGHTS_API_BASE_URL;
  const apiKey = process.env.HEALTH_INSIGHTS_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: 'Health Insights API is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const upstream = new URL('api/comments/selected', normalizedBaseUrl);

    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Insights-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error ?? `Health Insights API responded with ${response.status}.` },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to save selected comments.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
