import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.HEALTH_INSIGHTS_API_BASE_URL;

  if (!baseUrl) {
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
    const requestedLimit = request.nextUrl.searchParams.get('limit') ?? '20';
    const requestedFullText = request.nextUrl.searchParams.get('includeFullText') ?? 'true';
    const requestedToken = request.nextUrl.searchParams.get('token');

    if (!requestedToken) {
      return NextResponse.json({ error: 'Automation token is required.' }, { status: 401 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return NextResponse.json({ error: 'Date must use YYYY-MM-DD format.' }, { status: 400 });
    }

    if (!/^\d+$/.test(requestedLimit)) {
      return NextResponse.json({ error: 'Limit must be a positive integer.' }, { status: 400 });
    }

    if (!['true', 'false'].includes(requestedFullText)) {
      return NextResponse.json({ error: 'includeFullText must be true or false.' }, { status: 400 });
    }

    const upstream = new URL('api/automation/daily-candidates', normalizedBaseUrl);
    upstream.searchParams.set('token', requestedToken);
    upstream.searchParams.set('date', requestedDate);
    upstream.searchParams.set('limit', requestedLimit);
    upstream.searchParams.set('includeFullText', requestedFullText);

    const response = await fetch(upstream, {
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
        error: 'Failed to load cached daily candidates.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
