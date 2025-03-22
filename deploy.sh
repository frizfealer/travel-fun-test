#!/bin/bash

# Deployment script for Travel Fun frontend

echo "Travel Fun Deployment Script"
echo "============================"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI is not installed. Installing..."
    npm install -g netlify-cli
fi

# Build the Next.js application
echo "Building application..."
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!" 