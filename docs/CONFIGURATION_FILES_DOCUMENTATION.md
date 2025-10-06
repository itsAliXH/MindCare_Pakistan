# Configuration Files Documentation

This document provides detailed information about all configuration files in the project, explaining what work has been done and how each configuration file functions.

## Table of Contents
1. [Angular Configuration](#angular-configuration)
2. [Package.json Files](#packagejson-files)
3. [TypeScript Configuration](#typescript-configuration)
4. [Environment Files](#environment-files)
5. [Deployment Configuration](#deployment-configuration)
6. [Git Configuration](#git-configuration)

---

## Angular Configuration

### angular.json
**File Path:** `frontend/angular.json`

### Purpose
The Angular configuration file defines build settings, project structure, and deployment configuration for the Angular application.

### Work Done
1. **Build Configuration**: Set up build settings for development and production
2. **Output Path**: Configured output directory for builds
3. **Asset Configuration**: Set up asset handling and optimization
4. **Development Server**: Configured development server settings
5. **Production Optimization**: Enabled production optimizations

### Key Configuration
```json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "outputPath": "dist/frontend",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ],
              "outputHashing": "all"
            }
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "frontend:build:production"
            }
          }
        }
      }
    }
  }
}
```

### Key Features
- **Output Path**: `dist/frontend` for build output
- **Production Optimization**: Bundle optimization and hashing
- **Development Server**: Hot reload and development features
- **Asset Management**: Proper asset handling and optimization

---

## Package.json Files

### Frontend Package.json
**File Path:** `frontend/package.json`

### Purpose
Defines frontend dependencies, scripts, and project metadata for the Angular application.

### Work Done
1. **Dependencies**: Added all required Angular and third-party dependencies
2. **Scripts**: Configured build, serve, and test scripts
3. **Angular Version**: Set up Angular 17+ with latest features
4. **Development Dependencies**: Added development tools and testing frameworks

### Key Dependencies
```json
{
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular/build": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.2.0"
  }
}
```

### Scripts
```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  }
}
```

### Backend Package.json
**File Path:** `backend/package.json`

### Purpose
Defines backend dependencies, scripts, and project metadata for the Node.js/Express application.

### Work Done
1. **Dependencies**: Added Express, MongoDB, and utility dependencies
2. **Scripts**: Configured development, build, and seed scripts
3. **TypeScript**: Set up TypeScript compilation and development
4. **Development Tools**: Added development and debugging tools

### Key Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "csv-parser": "^3.0.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.0"
  }
}
```

### Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/utils/csvImport.ts"
  }
}
```

---

## TypeScript Configuration

### Frontend TypeScript Config
**File Path:** `frontend/tsconfig.json`

### Purpose
Configures TypeScript compilation for the Angular frontend application.

### Work Done
1. **Compiler Options**: Set up TypeScript compiler options
2. **Module Resolution**: Configured module resolution strategy
3. **Target Configuration**: Set compilation target and module system
4. **Path Mapping**: Configured path aliases for imports

### Key Configuration
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### Backend TypeScript Config
**File Path:** `backend/tsconfig.json`

### Purpose
Configures TypeScript compilation for the Node.js backend application.

### Key Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Environment Files

### Backend Environment Files

#### .env
**File Path:** `backend/.env`

### Purpose
Contains environment variables for backend configuration in development.

### Work Done
1. **Database Configuration**: MongoDB connection string
2. **Server Configuration**: Port and environment settings
3. **CORS Configuration**: Allowed origins for cross-origin requests
4. **API Configuration**: API prefix and settings

### Configuration
```env
# Backend Environment Variables

# MongoDB Connection
MONGODB_URI=mongodb+srv://forlogin:dzOOjVLoU9vfszrS@cluster0.vgl4xcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=https://mindcare-therapist.netlify.app

# API Configuration
API_PREFIX=/api
```

#### .env.example
**File Path:** `backend/.env.example`

### Purpose
Template file for environment variables with documentation.

### Configuration
```env
# Backend Environment Variables Example

# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Server Port
PORT=4000

# Node Environment
NODE_ENV=development

# CORS Origin
CORS_ORIGIN=http://localhost:4200

# API Prefix
API_PREFIX=/api
```

### Frontend Environment Files

#### .env
**File Path:** `frontend/.env`

### Purpose
Contains environment variables for frontend configuration.

### Configuration
```env
# Frontend Environment Variables

# API URL for the backend
NG_APP_API_URL=http://localhost:4000/api

# Application Title
NG_APP_TITLE=MindCare Pakistan

# Application Version
NG_APP_VERSION=1.0.0
```

#### .env.example
**File Path:** `frontend/.env.example`

### Purpose
Template file for frontend environment variables.

### Configuration
```env
# Frontend Environment Variables Example

# API URL for the backend
NG_APP_API_URL=http://localhost:4000/api

# Application Title
NG_APP_TITLE=MindCare Pakistan

# Application Version
NG_APP_VERSION=1.0.0
```

---

## Deployment Configuration

### Netlify Configuration
**File Path:** `frontend/netlify.toml`

### Purpose
Configures Netlify deployment settings for the frontend application.

### Work Done
1. **Build Configuration**: Set build command and output directory
2. **Redirect Rules**: Configured SPA routing with fallback to index.html
3. **Deployment Settings**: Optimized for Angular application deployment

### Configuration
```toml
[build]
  command = "ng build --configuration production"
  publish = "dist/frontend/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Key Features
- **Build Command**: Production build with optimization
- **Publish Directory**: Correct output directory for Angular 17+
- **SPA Routing**: Redirect all routes to index.html for client-side routing

---

## Git Configuration

### .gitignore Files

#### Root .gitignore
**File Path:** `.gitignore`

### Purpose
Defines files and directories to ignore in the root Git repository.

### Configuration
```gitignore
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
*/dist/
build/
*/build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
```

#### Backend .gitignore
**File Path:** `backend/.gitignore`

### Purpose
Defines files and directories to ignore in the backend directory.

### Configuration
```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
```

---

## Summary

The configuration files provide a comprehensive setup for the MindCare Pakistan application:

### Angular Configuration
- **Build Optimization**: Production-ready build configuration
- **Development Tools**: Hot reload and development server
- **Asset Management**: Proper asset handling and optimization

### Package Management
- **Dependency Management**: All required dependencies properly configured
- **Script Automation**: Build, serve, and test scripts
- **Version Control**: Consistent version management

### TypeScript Configuration
- **Type Safety**: Strict TypeScript configuration
- **Modern Features**: ES2022 target with modern features
- **Angular Integration**: Angular-specific compiler options

### Environment Configuration
- **Environment Separation**: Clear development/production separation
- **Security**: Sensitive data in environment files
- **Flexibility**: Easy configuration changes

### Deployment Configuration
- **Netlify Integration**: Optimized Netlify deployment
- **SPA Support**: Proper single-page application routing
- **Build Optimization**: Production build configuration

### Git Configuration
- **File Ignoring**: Proper .gitignore configuration
- **Security**: Environment files excluded from version control
- **Clean Repository**: Only necessary files tracked

These configuration files work together to provide a robust, scalable, and maintainable development and deployment environment for the MindCare Pakistan therapist finder application.
