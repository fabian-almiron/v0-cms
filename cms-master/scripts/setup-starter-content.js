#!/usr/bin/env node

/**
 * Setup Starter Content Script
 * 
 * This script creates complete starter content for a new CMS deployment:
 * - Default header and footer templates
 * - Placeholder pages (Home, About, Services, Contact)
 * - Navigation menu
 * - Rich placeholder content
 * 
 * Usage: node scripts/setup-starter-content.js
 */

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
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function main() {
  log(`${colors.bold}${colors.blue}🚀 CMS Starter Content Setup${colors.reset}\n`);
  
  try {
    // Check if we have the required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logError('Missing required environment variables!');
      log('\nRequired environment variables:');
      log('  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
      log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
      log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
      log('\nFor deployment, also add:');
      log('  CMS_SITE_ID=your-site-id (or will be auto-generated)');
      process.exit(1);
    }

    // Import and run the setup function
    log('Loading CMS data functions...');
    
    try {
      const { setupCompleteStarterSite } = require('../lib/cms-data.ts');
      
      log('Starting complete starter content setup...\n');
      const success = await setupCompleteStarterSite();
      
      if (success) {
        log('\n' + '='.repeat(60));
        logSuccess('🎉 STARTER CONTENT SETUP COMPLETE!');
        log('\n' + colors.green + 'Your CMS now includes:');
        log('   🏠 Home page with Hero, Features, and CTA');
        log('   ℹ️  About page with company information');
        log('   🛠️  Services page with pricing');
        log('   📞 Contact page with contact info');
        log('   🧭 Navigation menu linking all pages');
        log('   🎨 Professional header and footer templates');
        
        log('\n' + colors.yellow + 'Next steps:');
        log('   1. Visit /admin to customize the content');
        log('   2. Replace placeholder text and images');
        log('   3. Update branding and contact information');
        log('   4. Add your own pages and content');
        
        log('\n' + colors.green + '✅ Your website is ready to customize!');
        log(colors.reset);
      } else {
        logWarning('Setup completed with some issues');
        log('\nCheck the logs above for details.');
        log('You can run this script again or create content manually in /admin');
      }
      
    } catch (importError) {
      logError('Could not import setup functions');
      console.error('Import error:', importError.message);
      
      log('\nThis might happen if:');
      log('  1. Database is not properly configured');
      log('  2. Environment variables are missing');
      log('  3. Supabase connection is not working');
      
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
