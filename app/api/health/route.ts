import { NextResponse } from 'next/server'
import { ping, getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  try {
    await ping()
    const db = await getDb()
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      ok: true,
      database: db.databaseName,
      serverTime: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (err: any) {
    const responseTime = Date.now() - startTime
    return NextResponse.json({
      ok: false,
      error: err.message,
      responseTime: `${responseTime}ms`
    }, { status: 500 })
  }
}
