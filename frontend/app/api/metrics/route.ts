import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Metrics {
  timestamp: string;
  process: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpu: NodeJS.CpuUsage;
  };
  nodejs: {
    version: string;
    platform: string;
  };
}

export async function GET(request: NextRequest) {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  const metrics: Metrics = {
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      cpu: cpuUsage
    },
    nodejs: {
      version: process.version,
      platform: process.platform
    }
  };

  // Prometheus format (optional)
  const prometheusFormat = `
# HELP nodejs_process_uptime Process uptime in seconds
# TYPE nodejs_process_uptime gauge
nodejs_process_uptime ${metrics.process.uptime}

# HELP nodejs_memory_heap_used_bytes Heap memory used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Total heap memory in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memoryUsage.heapTotal}

# HELP nodejs_memory_rss_bytes Resident set size in bytes
# TYPE nodejs_memory_rss_bytes gauge
nodejs_memory_rss_bytes ${memoryUsage.rss}
`.trim();

  const acceptHeader = request.headers.get('accept') || '';
  
  if (acceptHeader.includes('text/plain')) {
    return new NextResponse(prometheusFormat, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
