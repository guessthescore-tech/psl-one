import { NextResponse } from 'next/server';
import { getWebRuntimeMetadata } from '@/lib/runtime-metadata';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    ...getWebRuntimeMetadata(),
    timestamp: new Date().toISOString(),
  });
}
