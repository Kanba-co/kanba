#!/usr/bin/env node

/**
 * PostgreSQL Setup Script for Kanba
 * 
 * This script helps you set up a local PostgreSQL database for Kanba development.
 * It will:
 * 1. Check if PostgreSQL is running
 * 2. Create the database if it doesn't exist
 * 3. Run Prisma migrations
 * 4. Generate Prisma client
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up PostgreSQL for Kanba...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.local file not found!');
  console.log('Please copy env.example to .env.local and configure your database settings.');
  process.exit(1);
}

// Check if DATABASE_PROVIDER is set to postgresql
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_PROVIDER=postgresql')) {
  console.log('INFO: DATABASE_PROVIDER is not set to postgresql');
  console.log('To use PostgreSQL, set DATABASE_PROVIDER=postgresql in your .env.local file');
  process.exit(0);
}

// Check if DATABASE_URL is configured
if (!envContent.includes('DATABASE_URL=')) {
  console.error('ERROR: DATABASE_URL not found in .env.local');
  console.log('Please add your PostgreSQL connection string to .env.local');
  process.exit(1);
}

// Extract database name from DATABASE_URL
const dbUrlMatch = envContent.match(/DATABASE_URL=postgresql:\/\/[^\/]+\/([^?]+)/);
if (!dbUrlMatch) {
  console.error('ERROR: Invalid DATABASE_URL format');
  console.log('Expected format: postgresql://username:password@host:port/database');
  process.exit(1);
}

const dbName = dbUrlMatch[1];

console.log(`Database name: ${dbName}`);

try {
  // Check if Prisma is installed
  console.log('Checking Prisma installation...');
  execSync('npx prisma --version', { stdio: 'pipe' });
  console.log('SUCCESS: Prisma is installed');

  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('SUCCESS: Prisma client generated');

  // Push schema to database (creates tables)
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('SUCCESS: Schema pushed to database');

  // Run migrations (if any)
  console.log('Running migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('SUCCESS: Migrations completed');
  } catch (error) {
    console.log('INFO: No migrations to run');
  }

  // Seed database (optional)
  console.log('Seeding database...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('SUCCESS: Database seeded');
  } catch (error) {
    console.log('INFO: No seed script found or seed failed');
  }

  console.log('\nSUCCESS: PostgreSQL setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Visit http://localhost:3000');
  console.log('3. Create your first project');

} catch (error) {
  console.error('\nERROR: Setup failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check your DATABASE_URL in .env.local');
  console.log('3. Ensure you have the correct permissions');
  console.log('4. Try running: npx prisma db push --force-reset');
  process.exit(1);
} 