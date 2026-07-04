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
    const upstream = new URL('api/comments/reviewed', normalizedBaseUrl);
    request.nextUrl.searchParams.forEach((value, key) => {
      upstream.searchParams.set(key, value);
    });

    const response = await fetch(upstream, {
      headers: {
        'X-Insights-Api-Key': apiKey,
      },
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
        error: 'Failed to load reviewed comments.',
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
    const upstream = new URL('api/comments/reviewed', normalizedBaseUrl);

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
        error: 'Failed to save reviewed comment.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
