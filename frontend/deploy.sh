#!/bin/bash

# FrogStop Frontend Deployment Script
# This script deploys the frontend to AWS Amplify using the 'banjo' profile

set -e

echo "🐸 FrogStop Deployment Starting..."
echo ""

# Set AWS profile
export AWS_PROFILE=banjo

# Check if AWS credentials are valid
echo "✓ Checking AWS credentials..."
aws sts get-caller-identity --profile banjo > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ AWS credentials valid (profile: banjo)"
else
    echo "✗ AWS credentials invalid. Please configure the 'banjo' profile:"
    echo "  aws configure --profile banjo"
    exit 1
fi

# Build the frontend
echo ""
echo "📦 Building frontend..."
npm run build

echo ""
echo "✓ Build complete! Output in dist/ folder"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Next Steps for Deployment:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: AWS Amplify Console (Recommended)"
echo "  1. Visit: https://console.aws.amazon.com/amplify/"
echo "  2. Click 'New app' → 'Host web app'"
echo "  3. Select 'Deploy without Git provider'"
echo "  4. Upload the dist/ folder"
echo "  5. Add environment variable:"
echo "     VITE_API_BASE_URL=https://krfvl0md2b.execute-api.us-east-1.amazonaws.com"
echo ""
echo "Option 2: Amplify CLI"
echo "  Run: AWS_PROFILE=banjo amplify publish"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
