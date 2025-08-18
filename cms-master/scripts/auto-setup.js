#!/usr/bin/env node

/**
 * Auto Environment Setup for Vercel
 * 
 * Reads your .env.local file and automatically sets all environment variables in Vercel
 * 
 * Usage: node scripts/auto-setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

async function autoSetupEnvironment() {
  log(`${colors.bold}${colors.blue}🚀 Auto-Setting Vercel Environment Variables${colors.reset}\n`);
  
  try {
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      logError('.env.local file not found!');
      log('\nCreate .env.local with your environment variables:');
      log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
      log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
      log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
      log('VERCEL_TOKEN=your-vercel-token');
      process.exit(1);
    }

    // Read and parse environment variables
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });

    log(`📝 Found ${Object.keys(envVars).length} environment variables in .env.local\n`);

    // Check if Vercel CLI is available
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
      logError('Vercel CLI not found. Install it first:');
      log('npm i -g vercel');
      process.exit(1);
    }

    // Set environment variables in Vercel
    let varsSet = 0;
    let varsSkipped = 0;
    let varsErrored = 0;

    // Priority variables to set first
    const priorityVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    // Set priority variables first
    for (const varName of priorityVars) {
      if (envVars[varName]) {
        try {
          // Use printf to handle special characters properly
          execSync(`printf '%s' "${envVars[varName]}" | vercel env add ${varName} production`, {
            stdio: 'pipe',
            shell: true
          });
          logSuccess(`Set ${varName}`);
          varsSet++;
        } catch (error) {
          const errorMessage = error.message || error.stderr?.toString() || error.stdout?.toString() || '';
          if (errorMessage.includes('already exists') || errorMessage.includes('already set')) {
            logWarning(`${varName} already exists in Vercel`);
            varsSkipped++;
          } else {
            logError(`Failed to set ${varName}: ${errorMessage.slice(0, 100)}`);
            varsErrored++;
          }
        }
      }
    }

    // Set all other variables
    Object.keys(envVars).forEach(varName => {
      if (!priorityVars.includes(varName)) {
        try {
          execSync(`printf '%s' "${envVars[varName]}" | vercel env add ${varName} production`, {
            stdio: 'pipe',
            shell: true
          });
          logSuccess(`Set ${varName}`);
          varsSet++;
                 } catch (error) {
           const errorMessage = error.message || error.stderr?.toString() || error.stdout?.toString() || '';
           if (errorMessage.includes('already exists') || errorMessage.includes('already set')) {
             logWarning(`${varName} already exists in Vercel`);
             varsSkipped++;
           } else {
             // Skip errors for non-critical variables
             varsSkipped++;
           }
         }
      }
    });

    // Summary
    log('\n' + '='.repeat(50));
    logSuccess(`🎉 Environment setup completed!`);
    log(`📊 Results:`);
    log(`   ✅ Set: ${varsSet} variables`);
    log(`   ⚠️  Skipped: ${varsSkipped} variables (already exist)`);
    if (varsErrored > 0) {
      log(`   ❌ Errors: ${varsErrored} variables`);
    }

    log('\n🚀 Ready to deploy! Run:');
    log(`   ${colors.green}vercel --prod${colors.reset}`);
    log('\n✨ Your CMS will auto-configure itself on deployment!');

  } catch (error) {
    logError(`Auto-setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
autoSetupEnvironment(); 