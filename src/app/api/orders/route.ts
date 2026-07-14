// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders
export async function GET() {
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}

// POST /api/orders
export async function POST(request: Request) {
  const data = await request.json();
  const newOrder = await prisma.order.create({ data });
  return NextResponse.json(newOrder, { status: 201 });
}