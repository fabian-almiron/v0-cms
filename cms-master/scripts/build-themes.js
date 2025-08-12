#!/usr/bin/env node

/**
 * Build Theme Assets
 * 
 * This script copies theme assets (CSS, JS) from the themes directory 
 * to the public directory so they can be served statically.
 * 
 * Usage: node scripts/build-themes.js
 */

const fs = require('fs')
const path = require('path')

// Discover themes by scanning the themes directory
function discoverThemes() {
  try {
    const themesPath = path.join(process.cwd(), 'components', 'themes')
    
    // Check if themes directory exists
    if (!fs.existsSync(themesPath)) {
      console.warn('Themes directory not found:', themesPath)
      return []
    }

    // Get all directories in themes folder
    const items = fs.readdirSync(themesPath, { withFileTypes: true })
    
    const themes = items
      .filter(item => item.isDirectory()) // Only directories
      .map(item => item.name)
      .filter(name => {
        // Check if directory has required register-blocks.tsx file
        const registerFile = path.join(themesPath, name, 'register-blocks.tsx')
        return fs.existsSync(registerFile)
      })
      .sort() // Alphabetical order

    return themes
    
  } catch (error) {
    console.error('Error discovering themes:', error)
    return []
  }
}

// Copy theme assets to public directory
function copyThemeAssets(themeName) {
  try {
    const sourcePath = path.join(process.cwd(), 'components', 'themes', themeName)
    const targetPath = path.join(process.cwd(), 'public', 'themes', themeName)
    
    // Ensure target directory exists
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    
    // Files to copy to public directory
    const assetFiles = ['styles.css', 'main.js']
    
    let copiedCount = 0
    for (const file of assetFiles) {
      const sourceFile = path.join(sourcePath, file)
      const targetFile = path.join(targetPath, file)
      
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, targetFile)
        console.log(`📁 Copied ${file} for theme "${themeName}"`)
        copiedCount++
      } else {
        console.log(`⚠️  Optional file ${file} not found for theme "${themeName}"`)
      }
    }
    
    console.log(`✅ Copied ${copiedCount} asset files for theme "${themeName}"`)
    return true
    
  } catch (error) {
    console.error(`Error copying assets for theme "${themeName}":`, error)
    return false
  }
}

// Copy all theme assets
function copyAllThemeAssets() {
  const themes = discoverThemes()
  let successCount = 0
  
  for (const theme of themes) {
    if (copyThemeAssets(theme)) {
      successCount++
    }
  }
  
  console.log(`🎨 Successfully copied assets for ${successCount}/${themes.length} themes`)
  return successCount === themes.length
}

function main() {
  console.log('🎨 Building theme assets...')
  console.log('This will copy CSS and JS files to public/themes/ directory')
  console.log('')
  
  try {
    // Discover and validate themes
    const themes = discoverThemes()
    console.log(`🔍 Found ${themes.length} theme(s): ${themes.join(', ')}`)
    console.log('')
    
    // Copy all theme assets
    const success = copyAllThemeAssets()
    
    if (success) {
      console.log('')
      console.log('✅ SUCCESS! Theme assets built successfully.')
      console.log('')
      console.log('📁 Assets copied to public/themes/ directory:')
      console.log('  • CSS files for dynamic loading')
      console.log('  • JavaScript files for enhanced functionality')
      console.log('')
      console.log('🎯 Benefits:')
      console.log('  • ⚡ Fast static asset serving')
      console.log('  • 🎨 Dynamic theme switching with JS')
      console.log('  • 📱 Enhanced interactivity')
      console.log('  • 🔧 Custom theme functionality')
      console.log('')
      console.log('Next: Your themes can now use custom JavaScript!')
    } else {
      console.log('')
      console.log('❌ Some theme assets failed to copy.')
      console.log('Check the logs above for specific errors.')
      process.exit(1)
    }
  } catch (error) {
    console.error('')
    console.error('❌ Error building theme assets:', error.message)
    console.error('')
    console.error('Troubleshooting:')
    console.error('  1. Check that your themes directory exists: components/themes/')
    console.error('  2. Ensure themes have proper structure (register-blocks.tsx, styles.css)')
    console.error('  3. Verify write permissions for public/themes/ directory')
    process.exit(1)
  }
}

// Run if called directly
main() 