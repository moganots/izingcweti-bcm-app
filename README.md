# Izingcweti (BCM)
## A Quasar Project for Business Continuity Management in the field.

https://img.shields.io/badge/TypeScript-5.3-blue.svg
https://img.shields.io/badge/Vue-3.4-green.svg
https://img.shields.io/badge/Quasar-2.14-blue.svg
https://img.shields.io/badge/Capacitor-5.7-1192D0.svg
https://img.shields.io/badge/Docker-Ready-2496ED.svg
https://img.shields.io/badge/License-Private-red.svg

# 📖 Table of Contents

- Introduction
- Features
- Key Technologies
- Prerequisites
- Docker Development Environment
- Local Development Setup
- Project Structure
- Development Commands
- Android APK Generation
- iOS App Generation
- Environment Configuration
- API Documentation
- Testing
- Troubleshooting
- Quick Command Reference
- Documentation
- Contributing
- License

# 📖 Introduction

The Izingcweti (BCM) is a comprehensive Business Continuity Management mobile application built with Quasar Framework, Vue 3, and Capacitor. It provides offline-first capabilities for field operations, enabling business continuity professionals to manage critical functions, conduct business impact analyses, maintain continuity plans, track risks, manage incidents, and handle compliance requirements from any mobile device.

# Purpose

- Enable BCM field operations with offline-first architecture
- Provide real-time access to critical business continuity data
- Support multi-tenant organisation management
- Ensure compliance with ISO 22301, NIST 800-34, FFIEC, and COBIT 2019
- Streamline workflow approvals and task management on the go
- Support multiple languages including Zulu and Afrikaans

# Platforms

- iOS (via Capacitor)
- Android (via Capacitor)
- Web (Single Page Application)

# ✨ Features

## 🏢 Organisation Management

- Multi-tenant organisation hierarchy
- Business unit management with criticality scoring
- Department configuration with RTO/RPO tracking
- Industry classification and maturity scoring

## 📊 BCM Lifecycle

- Critical Functions: Identify and track critical business functions with MTO/WRT
- Business Impact Analysis (BIA): Financial, operational, regulatory, and reputational impact assessment
- Business Continuity Plans (BCP): Plan versioning, approval workflows, emergency contacts
- Recovery Strategies: Strategy design with cost estimation and resource requirements
- Exercise Tests: BCP testing with lessons learned and corrective actions

## 🔒 Security & Access Control

- JWT-based authentication with refresh tokens
- Role-based access control (9 BCM-specific roles)
- Biometric authentication support (mobile)
- Secure local storage with encryption

## 🔄 Offline-First Synchronization

- Pending changes queue with priority management
- Conflict detection and resolution (Last Write Wins, Merge, User Mediated)
- Incremental delta synchronization
- Sync metadata and token management
- Automatic sync on reconnect

## 📋 Workflow Automation

- Configurable approval chains with state machine
- Task assignment and escalation management
- SLA tracking with priority-based routing
- 11 workflow states with validated transitions

## 📄 Document Management

- File upload with progress tracking
- Version-controlled document storage
- Approval workflows for BCM artefacts
- Document type classification and tagging
- Offline document access

## 🔔 Notification System

- Multi-channel notifications (Email, SMS, In-App, Push)
- Template-based notification generation
- User preference management per notification type
- Real-time notification polling

## 📈 Dashboard & Reporting

- Real-time KPIs and statistics
- Risk heat maps and trend analysis
- Compliance status tracking
- BCM maturity progress monitoring
- Incident trends and resolution metrics

## 🌍 Internationalization

- 2 supported languages: English, Zulu
- Dynamic language switching without app restart
- Locale-aware date, time, and number formatting

# 🔧 Key Technologies

Technology          Version     Purpose
Quasar Framework    2.14.x      UI component framework
Vue.js              3.4.x       Progressive JavaScript framework
TypeScript          5.3.x       Type-safe programming language
Vite                5.x         Build tool and dev server
Pinia               2.1.x       State management
Vue Router          4.2.x       Application routing
Capacitor           5.7.x       Native mobile deployment
Axios               1.6.x       HTTP client
Dexie.js            3.2.x       IndexedDB wrapper for offline storage
date-fns            3.3.x       Date manipulation library
CryptoJS            4.2.x       Client-side encryption
Vue I18n            9.x         Internationalization
VueUse              10.7.x      Vue Composition API utilities
ECharts             5.4.x       Data visualization
Sass/SCSS           1.32.x      CSS preprocessor

# Development Tools

Tool            Purpose
Docker          Containerized development environment
Docker Compose  Multi-container orchestration
ESLint          Code linting
Prettier        Code formatting
Vitest          Unit testing
Vue TSC         Type checking

# 📋 Prerequisites

## Software Requirements

- Node.js >= 20.x LTS
- npm >= 10.x
- Docker Desktop (for containerized development)
- Docker Compose >= 2.x
- Android Studio (for Android APK generation)
- Xcode (for iOS build, macOS only)

## Hardware Requirements

- CPU: 4+ cores recommended
- RAM: 8GB minimum, 16GB recommended
- Storage: 10GB+ available space
- Network: Internet connection for package installation

## Knowledge Requirements

- TypeScript/JavaScript development
- Vue 3 Composition API
- Quasar Framework basics
- Docker containerization basics

# 🐳 Docker Development Environment
This project uses Docker for a standardized development environment. All development should be done inside the Docker container to ensure consistency across different machines.

## Prerequisites

- Docker Desktop installed on your machine
- Docker Compose

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-org/izingcweti-bcm-app.git
cd izingcweti-bcm-app
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Start the Docker container:

```bash
docker-compose up -d
```

4. Access the container shell:

```bash
docker-compose exec app bash
```

5. Install dependencies (inside container):

```bash
npm install
```

## Working with Docker

### View container logs

```bash
docker-compose logs -f
```

### View specific service logs

```bash
docker-compose logs -f app
```

### Stop the container

```bash
docker-compose down
```

### Stop and remove volumes

```bash
docker-compose down -v
```

### Rebuild the container (if Dockerfile changes)

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Execute any command in the container

```bash
docker-compose exec app <command>
# Example: docker-compose exec app npm run test:unit
```

### Restart a specific service

```bash
docker-compose restart app
```

### Check container status

```bash
docker-compose ps
```

# 💻 Local Development Setup

If you prefer to develop without Docker:

1. Install Node.js 20.x LTS
2. Install dependencies:

```bash
npm install
```

3. Copy environment file:

```bash
cp .env.example .env
```

4. Start development server:

```bash
npm run dev
```

The app will be available at http://localhost:8080

5. For iOS development (macOS only):

```bash
npm run dev:ios
```

6. For Android development:

```bash
npm run dev:android
```

# 📁 Project Structure

izingcweti-bcm-app/
├── public/                        # Static assets
│   ├── icons/                     # App icons
│   └── manifest.json              # PWA manifest
├── src/
│   ├── assets/                    # Images, styles
│   │   ├── images/
│   │   └── styles/
│   │       ├── _variables.scss
│   │       ├── _mixins.scss
│   │       └── app.scss
│   ├── boot/                      # Boot files (run on app startup)
│   │   ├── auth.ts                # Authentication initialization
│   │   ├── axios.ts               # HTTP client configuration
│   │   ├── capacitor.ts           # Native platform features
│   │   ├── dexie.ts               # Local database initialization
│   │   ├── sync.ts                # Sync engine initialization
│   │   ├── i18n.ts                # Internationalization
│   │   ├── pinia.ts               # State management setup
│   │   └── error-handler.ts       # Global error handling
│   ├── components/                # Reusable Vue components
│   │   ├── common/                # Shared components
│   │   │   ├── AppDrawer.vue
│   │   │   ├── AppHeader.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   ├── EmptyState.vue
│   │   │   ├── FileUploader.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── OfflineBanner.vue
│   │   │   └── SearchBar.vue
│   │   ├── bcm/                   # BCM-specific components
│   │   ├── incident/              # Incident components
│   │   ├── workflow/              # Workflow components
│   │   └── dashboard/             # Dashboard components
│   ├── composables/               # Vue composables (reusable logic)
│   │   ├── useApi.ts
│   │   ├── useAuth.ts
│   │   ├── useCache.ts
│   │   ├── useNetwork.ts
│   │   ├── useNotifications.ts
│   │   ├── useOffline.ts
│   │   └── usePagination.ts
│   ├── i18n/                      # Internationalization
│   │   ├── index.ts
│   │   ├── en.ts                  # English (500+ keys)
│   │   ├── zu.ts                  # Zulu
│   ├── layouts/                   # Page layouts
│   │   ├── AuthLayout.vue
│   │   ├── MainLayout.vue
│   │   └── MinimalLayout.vue
│   ├── models/                    # Data models
│   │   ├── entities/              # Entity interfaces
│   │   │   ├── bcm.entity.ts
│   │   │   ├── incident.entity.ts
│   │   │   ├── organisation.entity.ts
│   │   │   ├── risk.entity.ts
│   │   │   ├── sync.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   ├── workflow.entity.ts
│   │   │   └── notification.entity.ts
│   │   └── dtos/                  # Data transfer objects
│   ├── pages/                     # Application pages
│   │   ├── auth/                  # Login, Forgot Password, Profile
│   │   ├── dashboard/             # Dashboard
│   │   ├── bcm/                   # BCM module pages
│   │   ├── risk/                  # Risk management pages
│   │   ├── incident/              # Incident management pages
│   │   ├── workflow/              # Workflow pages
│   │   ├── documents/             # Document management
│   │   ├── notifications/         # Notifications
│   │   └── settings/              # Settings
│   ├── router/                    # Vue Router configuration
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── guards.ts
│   ├── services/                  # Service layer
│   │   ├── api/                   # API services (12 services)
│   │   ├── db/                    # Database services
│   │   │   ├── Database.ts
│   │   │   ├── migrations.ts
│   │   │   └── repositories/      # Data repositories (19 repositories)
│   │   └── sync/                  # Sync engine
│   │       ├── SyncEngine.ts
│   │       ├── ConflictResolver.ts
│   │       ├── NetworkMonitor.ts
│   │       └── OfflineQueue.ts
│   ├── stores/                    # Pinia stores (10 stores)
│   │   ├── auth.store.ts
│   │   ├── bcm.store.ts
│   │   ├── dashboard.store.ts
│   │   ├── incident.store.ts
│   │   ├── notification.store.ts
│   │   ├── risk.store.ts
│   │   ├── sync.store.ts
│   │   ├── ui.store.ts
│   │   └── workflow.store.ts
│   ├── types/                     # TypeScript type definitions
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── bcm.types.ts
│   │   ├── sync.types.ts
│   │   └── db.types.ts
│   ├── utils/                     # Utility functions
│   │   ├── constants.ts
│   │   ├── date.utils.ts
│   │   ├── encryption.utils.ts
│   │   ├── file.utils.ts
│   │   ├── formatters.ts
│   │   ├── storage.utils.ts
│   │   └── validators.ts
│   ├── App.vue                    # Root component
│   └── env.d.ts                   # Environment type definitions
├── docker/                        # Docker configuration
│   ├── Dockerfile
│   ├── nginx/
│   │   └── nginx.conf
│   └── postgres/
│       └── init/
├── tests/                         # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example                   # Environment template
├── .gitignore
├── docker-compose.yml
├── capacitor.config.ts
├── quasar.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md

# 🚀 Development Commands

All commands should be run inside the Docker container after accessing it with docker-compose exec app bash.

## Start the app in development mode

```bash
npm run dev
```

The app will be available at http://localhost:8080

## Start with iOS simulator (macOS only)

```bash
npm run dev:ios
```

## Start with Android emulator

```bash
npm run dev:android
```

## Build the app for production

```bash
npm run build
```

## Build for iOS

```bash
npm run build:ios
```

## Build for Android

```bash
npm run build:android
```

## Lint the files

```bash
npm run lint
```

## Format the files

```bash
npm run format
```

## Type check

```bash
npm run type-check
```

## Run unit tests

```bash
npm run test:unit
```

## Run e2e tests

```bash
npm run test:e2e
```

## Run tests with coverage

```bash
npm run test:coverage
```

## Sync Capacitor plugins

```bash
npm run capacitor:sync
```

## Open iOS project in Xcode

```bash
npm run capacitor:open:ios
```

## Open Android project in Android Studio

```bash
npm run capacitor:open:android
```

# 📱 Android APK Generation

All APK generation commands should also be run inside the Docker container.

## Generate Keystore

To generate a keystore for signing your APK:

```bash

# Access the container first
docker-compose exec app bash

# Then run the keystore generator
npm run generate-keystore
# Or directly using the TypeScript script
npx tsx keystore-generator.ts
```

The keystore-generator.ts script will:

- Create a new keystore file at src-capacitor/android/izingcweti-bcm.keystore
- Configure it with the alias "izingcweti-bcm" and password "ibcm@s3cur3"
- Update the build.gradle file with the correct signing configuration

## Build APK

To build an APK (inside the container):

```bash
# For debug APK
npm run build-apk debug

# For release APK (requires keystore)
npm run build-apk release

# Or directly using the TypeScript script
npx tsx build-apk.ts debug
npx tsx build-apk.ts release
```

The APK will be built and copied to the project root directory as izingcweti-bcm-debug.apk or izingcweti-bcm-release.apk.

## Android Signing Configuration

The signing configuration in build.gradle should look like:

```gradle
signingConfigs {
    release {
        storeFile file('izingcweti-bcm.keystore')
        storePassword 'bcm360'
        keyAlias 'izingcweti-bcm'
        keyPassword 'bcm360'
    }
}
```

# 📱 iOS App Generation

iOS builds require macOS with Xcode installed.

## Prerequisites

- macOS with Xcode 15+
- Apple Developer account (for distribution)
- CocoaPods installed (sudo gem install cocoapods)

## Generate iOS App

```bash
# Build the web app first
npm run build

# Sync Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Build for Distribution

1. Open the project in Xcode
2. Select Product > Archive
3. Follow the Apple distribution workflow

# ⚙️ Environment Configuration

## Environment Variables

Copy .env.example to .env and configure:

```bash
# Application
VITE_APP_NAME="Izingcweti (BCM)"
VITE_APP_VERSION=25.0514.1
VITE_APP_DESCRIPTION="Business Continuity Management Mobile Application"

# Environment (Local, Development, Staging, Production)
VITE_ENV_NAME=Local
VITE_NODE_ENV=development

# API Configuration
VITE_API_BASE_URL=http://localhost:9810/api
VITE_API_TIMEOUT=30000

# Sync Configuration
VITE_SYNC_INTERVAL_MINUTES=5
VITE_SYNC_ENABLED=true

# Feature Flags
VITE_FEATURE_OFFLINE_MODE=true
VITE_FEATURE_BIOMETRIC=false
VITE_FEATURE_PUSH_NOTIFICATIONS=true
VITE_FEATURE_DARK_MODE=true
```

## Environment-Specific Files

File	            Environment
.env	            Local development
.env.dev            Development server
.env.uat            UAT (User Acceptance Testing) server
.env.stg            Staging server
.env.sit            SIT (System Integration Testing) server
.env.production     Production server
.env.dr             DR (Disaster Recovery) server

# 📚 API Documentation

## Swagger UI

Once the backend server is running: http://localhost:9810/swagger

## API Endpoints Overview

Module              Prefix                              Description
Auth                /api/auth                           Authentication and token management
Users               /api/users                          User management
Organisations       /api/organisations                  Organisation management
Critical Functions  /api/critical-functions             Critical function identification
BIA                 /api/business-impact-assessments    Business impact analysis
BCP                 /api/business-continuity-plans      Business continuity plans
Recovery Strategies /api/recovery-strategies            Recovery strategy management
Exercise Tests      /api/exercise-tests                 BCP testing and exercises
Risks               /api/risks                          Risk assessment and management
Compliance          /api/compliance-records             Compliance tracking
Incidents           /api/incidents                      Incident management
Workflows           /api/workflows                      Workflow automation
Documents           /api/documents                      Document management
Notifications       /api/notifications                  Notification system
Audit               /api/audit                          Audit logging
Sync                /api/sync                           Offline synchronization

## Postman Collection

Import postman/BCM-System-API.postman_collection.json for complete API testing.

# 🧪 Testing

```bash
# Run unit tests
docker-compose exec app npm run test:unit

# Run unit tests in watch mode
docker-compose exec app npm run test:unit:watch

# Run e2e tests
docker-compose exec app npm run test:e2e

# Run tests with coverage report
docker-compose exec app npm run test:coverage

# Run linting
docker-compose exec app npm run lint

# Run type checking
docker-compose exec app npm run type-check
```

## Test Structure

tests/
├── unit/                    # Unit tests
│   ├── services/            # Service tests
│   ├── stores/              # Store tests
│   ├── composables/         # Composable tests
│   └── utils/               # Utility tests
├── integration/             # Integration tests
│   ├── database/            # Database integration tests
│   └── api/                 # API integration tests
└── e2e/                     # End-to-end tests
    └── workflows/           # BCM workflow tests

# 🛠️ Troubleshooting

## Docker Issues

1. Container won't start:

- Check if ports are already in use: lsof -i :8080
- Ensure Docker Desktop is running
- Try docker-compose down then docker-compose up -d

2. Permission issues:

- The container runs as root by default
- Files created in the container will be owned by root
- Consider adding a non-root user in Dockerfile if needed

3. Hot reload not working:

- Check volume mounts in docker-compose.yml
- Ensure the app directory is properly mounted
- Try restarting the container: docker-compose restart app

4. Node modules not found:

```bash
docker-compose exec app rm -rf node_modules
docker-compose exec app npm install
```

## APK Generation Issues

1. Keystore password errors:

```bash
# Regenerate keystore inside container
docker-compose exec app npx tsx keystore-generator.ts
``

2. Build configuration issues:

- Ensure the build.gradle file has the correct signing configuration
- The release configuration should use alias "izingcweti-bcm" with password "ibcm@s3cur3"
- The debug configuration should use the default debug keystore

3. Verbose build output:

```bash
# Inside container
cd src-capacitor/android && ./gradlew assembleRelease --debug
```

4. Gradle build fails:

```bash
# Clean Gradle cache
cd src-capacitor/android && ./gradlew clean
```

## Development Issues

1. TypeScript errors:

```bash
npm run type-check
```

2. Lint errors:

```bash
npm run lint -- --fix
```

3. Database issues (IndexedDB):

- Clear browser data for the app
- In development, IndexedDB can be viewed in Chrome DevTools > Application > IndexedDB

4. Sync issues:

- Check network connectivity
- View sync status in the app drawer
- Check browser console for sync errors

# 🚀 Quick Command Reference

```bash
# Start development
docker-compose up -d
docker-compose exec app bash
npm run dev

# Build for production
docker-compose exec app npm run build

# Run tests
docker-compose exec app npm run test:unit

# Generate release APK
docker-compose exec app bash
npm run generate-keystore
npm run build-apk release

# Lint and format
docker-compose exec app npm run lint
docker-compose exec app npm run format

# Stop everything
docker-compose down
```

# 📋 Environment Details

The Docker container includes:

- Node.js 20.x LTS - JavaScript runtime
- npm 10.x - Package manager
- All necessary build tools for Quasar and Capacitor
- Android SDK dependencies for APK generation
- Proper permissions and configurations for development

## Container Services
Service     Port	Description
app         8080	Main application
postgres    5432	PostgreSQL database
redis       6379	Redis cache

# 📚 Documentation

- Architecture Overview - System architecture and design patterns
- API Reference - API endpoints and data structures
- Development Guide - Development workflow and best practices
- Sync Engine Guide - Offline sync architecture and usage
- Database Guide - Local database schema and migrations
- Testing Guide - Testing strategies and best practices
- Deployment Guide - Production deployment instructions

# 🤝 Contributing

## Commit Convention

We follow Conventional Commits:

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting, semicolons, etc.)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks

## Pull Request Guidelines

1. Create a feature branch from develop
2. Make your changes following the project conventions
3. Write or update tests as needed
4. Run linting and type checking
5. Submit a pull request with a clear description

# 📄 License
This project is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.

Copyright © 2025 Izingcweti BCM. All rights reserved.

# 📧 Contact

- Support: support@bcm.izingcweti.co.za
- Documentation: https://bcm.izingcweti.co.za/docs
- Issue Tracker: GitHub Issues