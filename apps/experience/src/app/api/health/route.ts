import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'web',
    environment: process.env['NEXT_PUBLIC_ENVIRONMENT_LABEL'] ?? 'unknown',
  });
}
