import { NextResponse } from 'next/server';
import JustWatchAPI from 'justwatch-api-client';

// Initialize the JustWatch API client
const justWatchApi = new JustWatchAPI(5000); // 5 seconds timeout

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const country = searchParams.get('country') || 'US';

  if (!query || query.trim() === '') {
    return NextResponse.json([]);
  }

  try {
    const results = await justWatchApi.search(query, country);
    return NextResponse.json(results ? results : []);
  } catch (error) {
    console.error('Error searching shows:', error);
    return NextResponse.json([], { status: 500 });
  }
}