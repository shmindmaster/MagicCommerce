
import { NextResponse } from 'next/server';

// This callback route is no longer needed with custom authentication
export async function GET(request) {
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(requestUrl.origin);
}
