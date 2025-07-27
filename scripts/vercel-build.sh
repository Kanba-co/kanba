#!/bin/bash

# Vercel build script
echo "Starting Vercel build..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema (if needed)
echo "Pushing database schema..."
npx prisma db push

# Build Next.js application
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!" 