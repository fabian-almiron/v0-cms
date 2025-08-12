#!/usr/bin/env node

/**
 * Automated Vercel Deployment Script
 * 
 * This script automatically:
 * 1. Deploys your project to Vercel
 * 2. Sets up required environment variables
 * 3. Configures the CMS for immediate use
 * 
 * Usage: node scripts/deploy-vercel-auto.js
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

function logStep(step, message) {
  log(`\n${colors.bold}${colors.blue}Step ${step}: ${message}${colors.reset}`);
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

async function checkRequirements() {
  logStep(1, 'Checking Requirements');
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    logSuccess('Vercel CLI is installed');
  } catch (error) {
    logError('Vercel CLI not found. Please install it first:');
    log('npm i -g vercel');
    process.exit(1);
  }

  // Check if .env.local exists and has Supabase config
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    logWarning('.env.local not found');
    log('Create .env.local with your Supabase configuration:');
    log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
    log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }

  logSuccess('Requirements check passed');
}

async function deployToVercel() {
  logStep(2, 'Deploying to Vercel');
  
  try {
    // Deploy to Vercel
    log('🚀 Deploying to Vercel...');
    const deployResult = execSync('vercel --prod --yes', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // Extract deployment URL
    const deploymentUrl = deployResult.match(/https:\/\/[^\s]+/)?.[0];
    if (deploymentUrl) {
      logSuccess(`Deployed to: ${deploymentUrl}`);
      return deploymentUrl;
    } else {
      logWarning('Could not extract deployment URL from Vercel output');
      return null;
    }
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

async function setupEnvironmentVariables() {
  logStep(3, 'Auto-Setting Environment Variables from .env.local');
  
  try {
    // Read local environment variables
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      logWarning('.env.local not found - skipping auto environment setup');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !key.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });

    // Auto-detect and set all relevant environment variables
    const autoSetVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'VERCEL_TOKEN',
      'VERCEL_TEAM_ID',
      'DEFAULT_OWNER_EMAIL'
    ];

    let varsSet = 0;
    let varsSkipped = 0;

    for (const varName of autoSetVars) {
      if (envVars[varName]) {
        try {
          // Use Vercel CLI to set environment variable
          const setCommand = `echo "${envVars[varName]}" | vercel env add ${varName} production`;
          execSync(setCommand, {
            encoding: 'utf-8',
            stdio: 'pipe',
            shell: true
          });
          logSuccess(`✅ Auto-set ${varName}`);
          varsSet++;
        } catch (error) {
          if (error.message.includes('already exists')) {
            logWarning(`⚠️  ${varName} already exists in Vercel`);
            varsSkipped++;
          } else {
            logError(`❌ Failed to set ${varName}: ${error.message}`);
          }
        }
      }
    }

    // Also set any other NEXT_PUBLIC_ variables found
    Object.keys(envVars).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_') && !autoSetVars.includes(key)) {
        try {
          const setCommand = `echo "${envVars[key]}" | vercel env add ${key} production`;
          execSync(setCommand, {
            encoding: 'utf-8',
            stdio: 'pipe',
            shell: true
          });
          logSuccess(`✅ Auto-set ${key}`);
          varsSet++;
        } catch (error) {
          if (error.message.includes('already exists')) {
            logWarning(`⚠️  ${key} already exists in Vercel`);
            varsSkipped++;
          }
        }
      }
    });

    if (varsSet > 0) {
      logSuccess(`🎉 Successfully auto-set ${varsSet} environment variables!`);
    }
    if (varsSkipped > 0) {
      log(`ℹ️  Skipped ${varsSkipped} existing variables`);
    }

    logSuccess('Environment variables auto-configuration completed');
  } catch (error) {
    logError(`Environment auto-setup failed: ${error.message}`);
    log('💡 You can still deploy manually and set variables in Vercel dashboard');
  }
}

async function triggerRedeployment() {
  logStep(4, 'Triggering Final Deployment');
  
  try {
    log('🔄 Redeploying with environment variables...');
    execSync('vercel --prod', { stdio: 'inherit' });
    logSuccess('Final deployment completed');
  } catch (error) {
    logError(`Final deployment failed: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}🚀 Automated Vercel Deployment for Page Builder CMS${colors.reset}\n`);
  
  await checkRequirements();
  const deploymentUrl = await deployToVercel();
  await setupEnvironmentVariables();
  await triggerRedeployment();

  log('\n' + '='.repeat(60));
  logSuccess('🎉 DEPLOYMENT COMPLETE!');
  log('\n' + colors.green + 'Your CMS is ready to use:');
  if (deploymentUrl) {
    log(`   🌐 Frontend: ${deploymentUrl}`);
    log(`   ⚙️  Admin: ${deploymentUrl}/admin`);
  }
  log('\n' + colors.yellow + 'Next steps:');
  log('   1. Visit the admin panel to complete site setup');
  log('   2. Create your first pages and navigation');
  log('   3. Customize themes and templates');
  log('\n' + colors.green + '✅ No manual environment variable setup needed!');
  log('✅ Site will automatically persist across deployments!');
  log(colors.reset);
}

// Run the script
main().catch(error => {
  logError(`Deployment script failed: ${error.message}`);
  process.exit(1);
}); 