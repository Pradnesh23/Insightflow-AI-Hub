import { updateSession } from "@/lib/supabase/middleware"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl

  // Skip monitoring for static files
  const isStaticFile = pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js)$/)
  const isHealthCheck = pathname.startsWith('/api/health') || pathname.startsWith('/api/metrics') || pathname.startsWith('/api/ready')

  // Skip authentication for health/metrics endpoints
  if (isHealthCheck) {
    return NextResponse.next()
  }

  try {
    // Update session
    const response = await updateSession(request)

    // Add performance monitoring headers (except for health checks)
    if (!isStaticFile && !isHealthCheck) {
      const duration = Date.now() - startTime
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Request-ID', crypto.randomUUID())

      // Log slow requests
      if (duration > 1000) {
        console.warn('Slow request detected:', {
          path: pathname,
          duration: `${duration}ms`,
          method: request.method,
        })
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error, {
      path: pathname,
      method: request.method,
    })
    throw error
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
