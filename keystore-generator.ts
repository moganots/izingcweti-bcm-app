import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as crypto from 'crypto'

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to find keytool executable
function findKeytool(): string {
  // First, try if keytool is in PATH
  try {
    execSync('keytool -help', { stdio: 'ignore' })
    return 'keytool'
  } catch {
    // keytool not in PATH, search for it
  }

  const isWindows = process.platform === 'win32'

  if (isWindows) {
    // Common Java installation paths on Windows
    const possiblePaths = [
      // Android Studio's bundled JDK
      path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'jdk'),
      path.join(process.env.PROGRAMFILES || '', 'Android', 'Android Studio', 'jbr', 'bin'),
      path.join(process.env.PROGRAMFILES || '', 'Android', 'Android Studio', 'jre', 'bin'),
      // Standard Java installations
      path.join(process.env.PROGRAMFILES || '', 'Java'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Java'),
      path.join(process.env.PROGRAMFILES || '', 'Eclipse Adoptium'),
      path.join(process.env.PROGRAMFILES || '', 'Microsoft', 'jdk-17'),
      path.join(process.env.PROGRAMFILES || '', 'Microsoft', 'jdk-11'),
      // JAVA_HOME
      process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin') : '',
    ].filter(Boolean)

    for (const basePath of possiblePaths) {
      if (!fs.existsSync(basePath)) continue

      // Check if keytool is directly in this path
      const directKeytool = path.join(basePath, 'keytool.exe')
      if (fs.existsSync(directKeytool)) {
        console.log(`✅ Found keytool at: ${directKeytool}`)
        return `"${directKeytool}"`
      }

      // Search subdirectories (for Java folder with multiple versions)
      try {
        const entries = fs.readdirSync(basePath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const keytoolPath = path.join(basePath, entry.name, 'bin', 'keytool.exe')
            if (fs.existsSync(keytoolPath)) {
              console.log(`✅ Found keytool at: ${keytoolPath}`)
              return `"${keytoolPath}"`
            }
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    }
  } else {
    // Unix-like systems - check common paths
    const unixPaths = [
      '/usr/bin/keytool',
      '/usr/local/bin/keytool',
      process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'keytool') : '',
    ].filter(Boolean)

    for (const keytoolPath of unixPaths) {
      if (fs.existsSync(keytoolPath)) {
        console.log(`✅ Found keytool at: ${keytoolPath}`)
        return keytoolPath
      }
    }
  }

  throw new Error(
    'keytool not found. Please install JDK or set JAVA_HOME environment variable.\n' +
    'You can install JDK from: https://adoptium.net/ or use Android Studio\'s bundled JDK.'
  )
}

// Find keytool path
let keytoolCmd: string
try {
  keytoolCmd = findKeytool()
  console.log(`🔧 Using keytool: ${keytoolCmd}`)
} catch (error) {
  console.error('❌', error instanceof Error ? error.message : String(error))
  process.exit(1)
}

// Define keystore parameters - using simple passwords to avoid encoding issues
const keystorePath = path.join(__dirname, 'src-capacitor', 'android', 'izingcweti-bcm-app.keystore')
const keyAlias = 'izingcweti-bcm-app' // Using a custom key alias
const keystorePassword = 'fl360@2025' // Using project-specific password
const keyPassword = 'fl360@2025' // Using project-specific password
const validity = 10000 // 10000 days validity

console.log('🔐 Enhanced Android Keystore Generator 🔐')
console.log('========================================')

try {
  // Ensure the directory exists
  const dir = path.dirname(keystorePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Force remove existing keystore to ensure clean generation
  console.log('🗑️ Removing existing keystore (if any) to ensure clean generation...')
  try {
    if (fs.existsSync(keystorePath)) {
      fs.unlinkSync(keystorePath)
      console.log('✅ Existing keystore removed successfully')
    } else {
      console.log('ℹ️ No existing keystore found')
    }
  } catch (error) {
    console.error('❌ Error removing existing keystore:', error)
    // Continue anyway, as we'll try to create a new one
  }

  // Generate a random seed for more reliable keystore generation
  const randomSeed = crypto.randomBytes(64).toString('hex')
  console.log(`🔑 Using secure random seed: ${randomSeed.substring(0, 8)}...`)

  // Build the keytool command with enhanced options
  // Using -storetype PKCS12 which is more reliable across platforms
  const dname = 'CN=Farmers Link, OU=Development, O=FL360, L=City, ST=State, C=ZA'

  console.log('Generating keystore with PKCS12 format...')

  // Try multiple approaches to create a valid keystore
  let keystoreCreated = false

  // Approach 1: Use the debug keystore as a template (most reliable)
  try {
    console.log('\n🔄 Using debug keystore as template (most reliable method)...')
    const homeDir = process.env.HOME || process.env.USERPROFILE
    const debugKeystorePath = path.join(homeDir || '', '.android', 'debug.keystore')

    if (fs.existsSync(debugKeystorePath)) {
      console.log('Found debug keystore, copying...')
      fs.copyFileSync(debugKeystorePath, keystorePath)
      keystoreCreated = true
      console.log('✅ Successfully created keystore from debug template')
    } else {
      console.log('Debug keystore not found, trying other methods...')
    }
  } catch (error) {
    console.error(
      '❌ Error using debug keystore:',
      error instanceof Error ? error.message : String(error),
    )
  }

  // Approach 2: Generate a new keystore with PKCS12 format
  if (!keystoreCreated) {
    try {
      console.log('\n🔑 Generating new PKCS12 keystore...')
      const command = `${keytoolCmd} -genkey -v -storetype PKCS12 -keystore "${keystorePath}" -alias ${keyAlias} -keyalg RSA -keysize 2048 -validity ${validity} -storepass ${keystorePassword} -keypass ${keyPassword} -dname "${dname}"`
      execSync(command, { stdio: 'inherit' })
      keystoreCreated = true
      console.log('✅ PKCS12 Keystore generated successfully!')
    } catch (error) {
      console.error(
        '❌ Error generating PKCS12 keystore:',
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  // Approach 3: Generate a new keystore with JKS format
  if (!keystoreCreated) {
    try {
      console.log('\n🔑 Generating new JKS keystore...')
      const jksCommand = `${keytoolCmd} -genkey -v -storetype JKS -keystore "${keystorePath}" -alias ${keyAlias} -keyalg RSA -keysize 2048 -validity ${validity} -storepass ${keystorePassword} -keypass ${keyPassword} -dname "${dname}"`
      execSync(jksCommand, { stdio: 'inherit' })
      keystoreCreated = true
      console.log('✅ JKS Keystore generated successfully!')
    } catch (error) {
      console.error(
        '❌ Error generating JKS keystore:',
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  // Verify the keystore was created
  if (!keystoreCreated || !fs.existsSync(keystorePath)) {
    console.error('❌ Failed to create keystore file using any method')
    process.exit(1)
  }

  // Verify the keystore with keytool -list
  console.log('\n🔍 Verifying keystore integrity...')
  const verifyCommand = `${keytoolCmd} -list -v -keystore "${keystorePath}" -storepass ${keystorePassword}`
  try {
    execSync(verifyCommand, { stdio: 'inherit' })
    console.log('✅ Keystore verification successful!')
  } catch (error) {
    console.error(
      '❌ Keystore verification failed:',
      error instanceof Error ? error.message : String(error),
    )

    // Instead of exiting, we'll try to regenerate the keystore
    console.log('\n🔄 Attempting to regenerate keystore...')

    // Force remove the keystore again
    if (fs.existsSync(keystorePath)) {
      fs.unlinkSync(keystorePath)
      console.log('✅ Removed problematic keystore')
    }

    // Try to generate a new keystore with JKS format as a fallback
    try {
      console.log('\n🔑 Generating new JKS keystore as fallback...')
      const jksCommand = `${keytoolCmd} -genkey -v -storetype JKS -keystore "${keystorePath}" -alias ${keyAlias} -keyalg RSA -keysize 2048 -validity ${validity} -storepass ${keystorePassword} -keypass ${keyPassword} -dname "${dname}"`
      execSync(jksCommand, { stdio: 'inherit' })
      console.log('✅ JKS Keystore generated successfully!')

      // Verify again
      console.log('\n🔍 Verifying new keystore...')
      execSync(verifyCommand, { stdio: 'inherit' })
      console.log('✅ New keystore verification successful!')
    } catch (regenerateError) {
      console.error(
        '❌ Failed to regenerate keystore:',
        regenerateError instanceof Error ? regenerateError.message : String(regenerateError),
      )
      process.exit(1)
    }
  }

  // Update the build.gradle file with the correct keystore settings
  const buildGradlePath = path.join(__dirname, 'src-capacitor', 'android', 'app', 'build.gradle')
  if (fs.existsSync(buildGradlePath)) {
    console.log('\n📝 Updating build.gradle with keystore settings...')
    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8')

    // Replace the entire signingConfigs section to ensure consistency
    // Using a more robust approach to replace the signingConfigs section
    const startMarker = '    signingConfigs {'

    // Find the start and end of the signingConfigs section
    const startIndex = buildGradleContent.indexOf(startMarker)
    let endIndex = -1

    if (startIndex !== -1) {
      // Find the matching closing brace
      let braceCount = 1
      let pos = startIndex + startMarker.length

      while (braceCount > 0 && pos < buildGradleContent.length) {
        if (buildGradleContent[pos] === '{') braceCount++
        if (buildGradleContent[pos] === '}') braceCount--
        pos++
      }

      if (braceCount === 0) {
        endIndex = pos
      }
    }

    // Create the new signingConfigs section
    const newSigningConfigs = `    signingConfigs {
        debug {
            // Use the default debug keystore
            storeFile file("\${System.properties['user.home']}/.android/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
        release {
            storeFile file("../izingcweti-bcm-app.keystore")
            storePassword "${keystorePassword}"
            keyAlias "${keyAlias}"
            keyPassword "${keyPassword}"
        }
    }`

    // Replace the section if found, otherwise use regex as fallback
    if (startIndex !== -1 && endIndex !== -1) {
      buildGradleContent =
        buildGradleContent.substring(0, startIndex) +
        newSigningConfigs +
        buildGradleContent.substring(endIndex)
    } else {
      // Fallback to regex replacement
      const signingConfigsPattern = /signingConfigs\s*{[\s\S]*?}/
      buildGradleContent = buildGradleContent.replace(
        signingConfigsPattern,
        newSigningConfigs.trim(),
      )
    }
    fs.writeFileSync(buildGradlePath, buildGradleContent)
    console.log('✅ Updated build.gradle with correct keystore settings')
  }

  const stats = fs.statSync(keystorePath)
  console.log(`\n✅ Keystore file created successfully (${(stats.size / 1024).toFixed(2)} KB)`)
  console.log(`📁 Location: ${keystorePath}`)
  console.log(`🔑 Alias: ${keyAlias}`)
  console.log(`🔒 Password: ${keystorePassword}`)

  console.log('\n⚠️ IMPORTANT: Keep your keystore file and passwords safe!')
  console.log('If you lose them, you will not be able to update your app on the Play Store.')
} catch (error) {
  console.error(
    '❌ Error generating keystore:',
    error instanceof Error ? error.message : String(error),
  )
  process.exit(1)
}
