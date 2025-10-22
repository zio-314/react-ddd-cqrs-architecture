/**
 * 心跳检测 API
 * Health Check / Ping API
 *
 * 简单的心跳检测，返回 ok 和时间戳
 *
 * 路由：GET /api/ping
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/ping
 * 心跳检测端点
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
}
