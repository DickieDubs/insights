// src/app/api/trends/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export const dynamic = 'force-static';

import { getTrendData } from '@/lib/firebase/firestore-service';

export async function GET(request: NextRequest) {
  try {
    // In a real application, you might parse query parameters from request.url.
    // const { searchParams } = new URL(request.url);
    // const timePeriod = searchParams.get('timePeriod');
    // const category = searchParams.get('category');
    // const region = searchParams.get('region');

    // For now, we fetch mock data
    const trendData = await getTrendData();
    return NextResponse.json(trendData);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return NextResponse.json({ message: 'Error fetching trend data', error: (error as Error).message }, { status: 500 });
  }
}

// Optionally, specify the Edge runtime
// export const runtime = 'edge';
