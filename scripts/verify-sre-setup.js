#!/usr/bin/env node

/**
 * SRE Setup Verification Script
 * Checks if all required files and configurations are present
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`),
};

const requiredFiles = [
  // Docker
  'Dockerfile',
  'Dockerfile.dev',
  'docker-compose.yml',
  'docker-compose.dev.yml',
  '.dockerignore',

  // CI/CD
  '.github/workflows/ci.yml',
  '.github/workflows/cd.yml',
  '.github/workflows/docker-publish.yml',

  // Terraform
  'terraform/main.tf',
  'terraform/variables.tf',
  'terraform/vercel.tf',
  'terraform/outputs.tf',
  'terraform/terraform.tfvars.example',

  // Monitoring
  'monitoring/prometheus.yml',
  'monitoring/grafana/datasources/prometheus.yml',
  'monitoring/grafana/dashboards/dashboard.yml',

  // Sentry
  'instrumentation.ts',
  'sentry.client.config.ts',
  'sentry.server.config.ts',
  'sentry.edge.config.ts',

  // Health & Monitoring
  'app/api/health/route.ts',
  'app/api/ready/route.ts',
  'app/api/metrics/route.ts',

  // Libraries
  'lib/logger.ts',
  'lib/rate-limiter.ts',
  'lib/circuit-breaker.ts',

  // Configuration
  'next.config.mjs',
  'package.json',
  'jest.config.js',
  'jest.setup.js',

  // Environment
  '.env.example',
  '.env.production.example',

  // Documentation
  'SRE-GUIDE.md',
  'DEPLOYMENT.md',
  'SRE-IMPLEMENTATION-SUMMARY.md',

  // Utilities
  'Makefile',
  'make.ps1',
];

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
];

const optionalEnvVars = [
  'SENTRY_DSN',
  'REDIS_URL',
  'VERCEL_TOKEN',
];

function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log.warning('.env.local not found. Copy .env.example to .env.local');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = requiredEnvVars.filter(
    (varName) => !envContent.includes(varName)
  );

  if (missingVars.length > 0) {
    log.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  log.success('.env.local configured with required variables');
  return true;
}

function checkPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const requiredDeps = [
    '@sentry/nextjs',
    'prom-client',
  ];

  const missingDeps = requiredDeps.filter(
    (dep) => !packageJson.dependencies[dep]
  );

  if (missingDeps.length > 0) {
    log.error(`Missing dependencies: ${missingDeps.join(', ')}`);
    log.info('Run: npm install --legacy-peer-deps');
    return false;
  }

  log.success('All required dependencies present');
  return true;
}

function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SRE Setup Verification');
  console.log('='.repeat(60) + '\n');

  let allPassed = true;

  // Check files
  console.log('📁 Checking required files...\n');
  let filesOk = true;
  requiredFiles.forEach((file) => {
    if (checkFileExists(file)) {
      log.success(file);
    } else {
      log.error(`Missing: ${file}`);
      filesOk = false;
      allPassed = false;
    }
  });

  // Check package.json
  console.log('\n📦 Checking dependencies...\n');
  const depsOk = checkPackageJson();
  if (!depsOk) allPassed = false;

  // Check environment
  console.log('\n🔐 Checking environment configuration...\n');
  const envOk = checkEnvFile();
  if (!envOk) allPassed = false;

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    log.success('All checks passed! ✨');
    console.log('\nYou can now:');
    console.log('  1. Run: npm install --legacy-peer-deps');
    console.log('  2. Run: npm run dev');
    console.log('  3. Run: .\\make.ps1 docker-prod');
    console.log('  4. Visit: http://localhost:3000/api/health');
  } else {
    log.error('Some checks failed. Please review the output above.');
    console.log('\nRefer to SRE-GUIDE.md for setup instructions.');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

main();
