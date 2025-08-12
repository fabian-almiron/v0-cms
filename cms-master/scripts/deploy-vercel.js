#!/usr/bin/env node

/**
 * Vercel Deployment Script with Environment Variables
 * 
 * This script helps deploy the Page Builder CMS to Vercel
 * and automatically sets up environment variables.
 */

const { spawn } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    })
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
  })
}

async function main() {
  console.log('🚀 Page Builder CMS - Vercel Deployment Script')
  console.log('===============================================')
  console.log('')
  
  try {
    // Check if vercel CLI is installed
    console.log('📋 Checking Vercel CLI...')
    try {
      await runCommand('vercel', ['--version'])
    } catch (error) {
      console.log('❌ Vercel CLI not found. Installing...')
      await runCommand('npm', ['install', '-g', 'vercel'])
    }
    
    // Login to Vercel
    console.log('\n🔐 Logging in to Vercel...')
    await runCommand('vercel', ['login'])
    
    // Deploy the project
    console.log('\n🚀 Deploying to Vercel...')
    await runCommand('vercel', ['--prod'])
    
    // Set up environment variables
    console.log('\n⚙️  Setting up environment variables...')
    console.log('Please provide your Supabase credentials:')
    console.log('(You can find these in Supabase Dashboard → Settings → API)')
    console.log('')
    
    const supabaseUrl = await question('NEXT_PUBLIC_SUPABASE_URL (https://[project-ref].supabase.co): ')
    const supabaseAnonKey = await question('NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJhbGciOiJIUzI1NiIs...): ')
    const supabaseServiceKey = await question('SUPABASE_SERVICE_ROLE_KEY (eyJhbGciOiJIUzI1NiIs...): ')
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.log('❌ All environment variables are required!')
      process.exit(1)
    }
    
    // Set environment variables
    console.log('\n📝 Setting environment variables...')
    
    await runCommand('vercel', ['env', 'add', 'NEXT_PUBLIC_SUPABASE_URL', 'production'])
    await runCommand('vercel', ['env', 'add', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'production'])
    await runCommand('vercel', ['env', 'add', 'SUPABASE_SERVICE_ROLE_KEY', 'production'])
    
    // Redeploy with environment variables
    console.log('\n🔄 Redeploying with environment variables...')
    await runCommand('vercel', ['--prod'])
    
    console.log('\n✅ Deployment completed successfully!')
    console.log('🎉 Your Page Builder CMS is now live!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Visit your deployment URL')
    console.log('2. Go to /admin to complete site setup')
    console.log('3. Create your first site and start building!')
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main() 