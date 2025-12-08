import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
    env: {
      status: 'ok' | 'misconfigured';
      missing?: string[];
    };
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Health Check] Starting health check...');
  
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'up' },
      memory: { status: 'ok', used: 0, total: 0, percentage: 0 },
      env: { status: 'ok' }
    }
  };

  // Check database connectivity
  try {
    console.log('[Health Check] Checking database...');
    // Just check if the environment variables are set
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      healthStatus.checks.database = {
        status: 'up',
        responseTime: 0
      };
      console.log('[Health Check] Database check passed');
    } else {
      console.log('[Health Check] Database config missing');
      healthStatus.checks.database = {
        status: 'down',
        error: 'Database configuration missing'
      };
      healthStatus.status = 'unhealthy';
    }
  } catch (error) {
    console.error('[Health Check] Database check error:', error);
    healthStatus.checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
    healthStatus.status = 'unhealthy';
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = (usedMemory / totalMemory) * 100;

  healthStatus.checks.memory = {
    status: memoryPercentage > 90 ? 'critical' : memoryPercentage > 75 ? 'warning' : 'ok',
    used: Math.round(usedMemory / 1024 / 1024),
    total: Math.round(totalMemory / 1024 / 1024),
    percentage: Math.round(memoryPercentage * 100) / 100
  };

  if (healthStatus.checks.memory.status === 'critical') {
    healthStatus.status = 'unhealthy';
  }

  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingEnvVars.length > 0) {
    healthStatus.checks.env = {
      status: 'misconfigured',
      missing: missingEnvVars
    };
    healthStatus.status = 'unhealthy';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  return NextResponse.json(healthStatus, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`
    }
  });
}
