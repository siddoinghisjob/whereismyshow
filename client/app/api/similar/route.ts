import { NextResponse } from 'next/server';
import JustWatchAPI from 'justwatch-api-client';

// Initialize the JustWatch API client
const justWatchApi = new JustWatchAPI(5000); // 5 seconds timeout

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showId = searchParams.get('showId');
  const country = searchParams.get('country') || 'US';

  if (!showId) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const similarTitles = await justWatchApi.getSimiliarTitles(showId, country);
    
    return NextResponse.json(similarTitles);
  } catch (error) {
    console.error('Error getting similar titles:', error);
    return NextResponse.json([], { status: 500 });
  }
}