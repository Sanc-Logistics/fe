// src/app/api/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'Welcome to the SANC-LOGISTICS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}