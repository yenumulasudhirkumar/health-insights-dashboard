import { NextRequest, NextResponse } from 'next/server';

const AUTOMATION_TOKEN = '130f4c3e1110aa377a09616d490bf686491e847fb2d746468ca5836b4830867a';

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const baseUrl = process.env.HEALTH_INSIGHTS_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: 'Health Insights API is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { date } = await context.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Date must use YYYY-MM-DD format.' }, { status: 400 });
    }

    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const upstream = new URL('api/automation/daily-candidates', normalizedBaseUrl);
    upstream.searchParams.set('token', AUTOMATION_TOKEN);
    upstream.searchParams.set('date', date);
    upstream.searchParams.set('limit', '20');
    upstream.searchParams.set('includeFullText', 'true');

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
