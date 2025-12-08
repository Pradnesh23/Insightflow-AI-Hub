import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    externalAPIs: boolean;
  };
  message?: string;
}

export async function GET(request: NextRequest) {
  const readinessStatus: ReadinessStatus = {
    ready: true,
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      externalAPIs: false
    }
  };

  // Check if database is ready and responding
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('datasets').select('id').limit(1);
    readinessStatus.checks.database = !error;
    
    if (error) {
      readinessStatus.ready = false;
      readinessStatus.message = 'Database not ready';
    }
  } catch (error) {
    readinessStatus.checks.database = false;
    readinessStatus.ready = false;
    readinessStatus.message = 'Database connection failed';
  }

  // Check if Gemini API key is configured
  if (process.env.GEMINI_API_KEY) {
    readinessStatus.checks.externalAPIs = true;
  } else {
    readinessStatus.ready = false;
    readinessStatus.message = 'External APIs not configured';
  }

  const statusCode = readinessStatus.ready ? 200 : 503;

  return NextResponse.json(readinessStatus, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
