#!/bin/bash
set -e

PROJECT_NAME="frogstop"
ENV_NAME="dev"
PROFILE_NAME="banjo"

echo "Using Profile: $PROFILE_NAME"

# JSON configuration for Amplify Init
AMPLIFY_CONFIG="{\
\"projectName\":\"$PROJECT_NAME\",\
\"envName\":\"$ENV_NAME\",\
\"defaultEditor\":\"code\"\
}"

PROVIDERS_CONFIG="{\
\"awscloudformation\":{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"$PROFILE_NAME\"\
}\
}"

FRONTEND_CONFIG="{\
\"frontend\":\"javascript\",\
\"framework\":\"react\",\
\"config\":{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"dist\",\
\"BuildCommand\":\"npm run build\",\
\"StartCommand\":\"npm run dev\"\
}\
}"

echo "Initializing Amplify Project..."
amplify init \
--amplify "$AMPLIFY_CONFIG" \
--providers "$PROVIDERS_CONFIG" \
--frontend "$FRONTEND_CONFIG" \
--yes

echo "Adding Hosting (Manual Deployment via Amplify Console)..."
# Using "amplify hosting" category
# We want manual deployment.
# Note: "amplify add hosting" headless support varies.
# Try generic manual hosting.
# Usually: { "service": "hosting", "type": "manual" } works for Amplify Console manual.
# If strict S3AndCloudFront is needed: { "service": "hosting", "providerPlugin": "awscloudformation", "type": "S3AndCloudFront" }

# Let's try to just run 'amplify add hosting' properly.
# But for headless, we need the parameters.
# For Amplify Console Manual:
HOSTING_CONFIG="{\
\"service\":\"hosting\",\
\"type\":\"manual\"\
}"

amplify add hosting --headless "$HOSTING_CONFIG"

echo "Amplify Setup Complete. You can now run: AWS_PROFILE=$PROFILE_NAME amplify publish"
