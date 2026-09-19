import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdmin(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const sources = await prisma.source.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ sources })
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const source = await prisma.source.create({ data: body })
  return NextResponse.json({ source })
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { id, ...data } = body
  const source = await prisma.source.update({ where: { id }, data })
  return NextResponse.json({ source })
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await req.json()
  await prisma.source.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
