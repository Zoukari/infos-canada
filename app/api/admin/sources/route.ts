import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sources = await prisma.source.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ sources })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const source = await prisma.source.create({ data: body })
  return NextResponse.json({ source })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const source = await prisma.source.update({ where: { id }, data })
  return NextResponse.json({ source })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await prisma.source.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
