import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Building APK for Android 📱");
console.log("=============================");

// Define build type
const buildType = process.argv[2] || "debug";
const environ = (process.argv[3] || "dev").toUpperCase();
if (!["debug", "release"].includes(buildType)) {
  console.error('❌ Invalid build type. Use "debug" or "release"');
  process.exit(1);
}

if (!["DEV", "QA", "PROD"].includes(environ)) {
  console.error('❌ Invalid environment. Use "DEV", "QA", or "PROD"');
  process.exit(1);
}

// Function to prompt for version number
const promptForVersion = (): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Read current version from package.json
    const packageJsonPath = path.join(__dirname, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const currentVersion = packageJson.version;

    rl.question(
      `📝 Enter version number (current: ${currentVersion}): `,
      (answer) => {
        rl.close();
        const version = answer.trim() || currentVersion;
        resolve(version);
      },
    );
  });
};

// Function to update package.json version
const updatePackageVersion = (version: string) => {
  const packageJsonPath = path.join(__dirname, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.version = version;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n",
  );
  console.log(`✅ Updated package.json version to ${version}`);
};

// Function to update Android build.gradle version
const updateAndroidVersion = (version: string) => {
  const buildGradlePath = path.join(
    __dirname,
    "src-capacitor",
    "android",
    "app",
    "build.gradle",
  );

  if (!fs.existsSync(buildGradlePath)) {
    console.log(
      "⚠️ Android build.gradle not found, skipping Android version update",
    );
    return;
  }

  let buildGradleContent = fs.readFileSync(buildGradlePath, "utf8");

  // Generate version code from version string (e.g., "1.2.3" -> 10203)
  const versionParts = version.split(".").map((part) => parseInt(part) || 0);
  const versionCode =
    (versionParts[0] || 0) * 10000 +
    (versionParts[1] || 0) * 100 +
    (versionParts[2] || 0);

  // Update versionCode and versionName
  buildGradleContent = buildGradleContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`,
  );
  buildGradleContent = buildGradleContent.replace(
    /versionName\s+"[^"]*"/,
    `versionName "${version}"`,
  );

  fs.writeFileSync(buildGradlePath, buildGradleContent);
  console.log(
    `✅ Updated Android version to ${version} (versionCode: ${versionCode})`,
  );
};

// Prompt for version and update package.json and Android version
const version = await promptForVersion();
updatePackageVersion(version);
updateAndroidVersion(version);

try {
  // Step 1: Check if keystore exists for release builds
  if (buildType === "release") {
    const keystorePath = path.resolve(
      __dirname,
      "src-capacitor",
      "android",
      "izingcweti-bcm-app.keystore",
    );
    console.log(`\n🔑 Checking keystore at: ${keystorePath}`);

    if (!fs.existsSync(keystorePath)) {
      console.log("⚠️ Keystore not found. Generating keystore first...");
      execSync("npx tsx keystore-generator.ts", { stdio: "inherit" });
    } else {
      console.log("✅ Keystore found");

      // Verify the keystore is valid
      try {
        console.log("🔍 Verifying keystore integrity...");
        execSync(
          `keytool -list -v -keystore "${keystorePath}" -storepass fl360`,
          {
            stdio: "inherit",
          },
        );
        console.log("✅ Keystore verification successful!");
      } catch (error) {
        console.log(
          "⚠️ Keystore verification failed:",
          error instanceof Error ? error.message : String(error),
        );
        console.log("🔄 Regenerating keystore...");
        console.log("🗑️ Removing existing keystore...");
        try {
          fs.unlinkSync(keystorePath);
          console.log("✅ Existing keystore removed successfully");
        } catch (removeError) {
          console.log("⚠️ Error removing keystore:", removeError);
          // Continue anyway
        }
        console.log("🔄 Running keystore generator...");
        execSync("npx tsx keystore-generator.ts", { stdio: "inherit" });
      }
    }
  }

  // Step 2: Build the web application
  console.log("📦 Building web application...");
  execSync(`npm run build:android:${environ.toLowerCase()}`, {
    stdio: "inherit",
  });

  // Step 3: Sync with Capacitor
  console.log("\n🔄 Syncing with Capacitor...");
  execSync("npx cap sync android", {
    stdio: "inherit",
    cwd: path.join(__dirname, "src-capacitor"),
  });

  // Step 4: Build the APK
  console.log(`\n🛠️ Building ${buildType} APK...`);

  // On Windows, use .\gradlew.bat instead of ./gradlew
  const isWindows = process.platform === "win32";
  const gradleCommand = isWindows ? ".\\gradlew.bat" : "./gradlew";

  // Add flags to skip lint-related tasks for release builds (only skip tasks that exist)
  const skipLintFlags = buildType === "release" ? "-x lint" : "";

  execSync(
    `${gradleCommand} assemble${
      buildType.charAt(0).toUpperCase() + buildType.slice(1)
    } ${skipLintFlags} --stacktrace`,
    {
      stdio: "inherit",
      cwd: path.join(__dirname, "src-capacitor", "android"),
    },
  );

  // Get the APK path
  const apkDir = path.join(
    __dirname,
    "src-capacitor",
    "android",
    "app",
    "build",
    "outputs",
    "apk",
    buildType,
  );
  const apkName = `app-${buildType}.apk`;
  const apkPath = path.join(apkDir, apkName);

  if (fs.existsSync(apkPath)) {
    // Copy APK to project root for easier access
    const apkName =
      buildType === "release"
        ? `fl360.${environ}.${version}.${buildType}.apk`
        : `izingcweti-bcm-app-${environ}-${version}-${buildType}.apk`;
    const destPath = path.join(__dirname, apkName);
    fs.copyFileSync(apkPath, destPath);

    console.log("\n✅ Build completed successfully!");
    console.log(`📱 APK location: ${destPath}`);

    // Show APK size
    const stats = fs.statSync(destPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 APK size: ${fileSizeInMB} MB`);
    console.log(
      `🔑 Build type: ${buildType} (${
        buildType === "debug" ? "Debug keystore" : "Release keystore"
      })`,
    );

    console.log("\n📲 Installation options:");
    console.log(`Fresh install: adb install "${destPath}"`);
    console.log(`Update install: adb install -r "${destPath}"`);

    console.log("\n⚠️  IMPORTANT - Signature Conflicts:");
    console.log("• Debug and release builds use different signing keys");
    console.log(
      "• You cannot update a debug APK with a release APK (or vice versa)",
    );
    console.log('• If you get "conflicting package" error, you need to:');
    console.log(
      "  1. Uninstall the existing app first: adb uninstall com.fl360.app",
    );
    console.log(
      '  2. Then install the new APK: adb install "' + destPath + '"',
    );
    console.log(
      '• Or use: adb install -r -d "' +
        destPath +
        '" (force downgrade if needed)',
    );

    if (buildType === "release") {
      console.log("\n🔐 Release Build Notes:");
      console.log("• This APK is signed with the production keystore");
      console.log("• Use this for production/distribution");
      console.log(
        "• Cannot be installed over debug builds without uninstalling first",
      );
    } else {
      console.log("\n🛠️  Debug Build Notes:");
      console.log("• This APK is signed with the debug keystore");
      console.log("• Use this for development/testing");
      console.log(
        "• Cannot be installed over release builds without uninstalling first",
      );
    }
  } else {
    console.error(`❌ APK not found at expected location: ${apkPath}`);
  }
} catch (error) {
  console.error(
    "❌ Build failed:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
}
