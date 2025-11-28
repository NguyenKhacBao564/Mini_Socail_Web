#!/bin/bash

# Configuration
PROJECT_ID="healthy-system-479516-u4"
REGION="asia-southeast1"
REPO_NAME="omnisocial-repo"
ARTIFACT_HOST="$REGION-docker.pkg.dev"
REPO_PATH="$ARTIFACT_HOST/$PROJECT_ID/$REPO_NAME"

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🚀 Starting OmniSocial Build & Push Process..."
echo "Target: $REPO_PATH"

# Ensure Artifact Registry API is enabled
echo "Checking Artifact Registry API..."
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com --project "$PROJECT_ID"

# Create repository if it doesn't exist
echo "Ensuring repository '$REPO_NAME' exists..."
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for OmniSocial" \
    --project=$PROJECT_ID \
    --quiet || echo "Repository likely exists, continuing..."

# Function to build and push
build_and_push() {
    SERVICE_NAME=$1
    DIR_PATH=$2
    
    IMAGE_TAG="$REPO_PATH/$SERVICE_NAME"
    
    echo -e "\n${GREEN}🔨 Building and Pushing $SERVICE_NAME...${NC}"
echo "Context: $DIR_PATH"
echo "Tag: $IMAGE_TAG"
    
gcloud builds submit "$DIR_PATH" --tag "$IMAGE_TAG" --project "$PROJECT_ID"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $SERVICE_NAME Build Successful${NC}"
    else
        echo "❌ $SERVICE_NAME Build Failed"
        exit 1
    fi
}

# --- Build Services ---

# 1. API Gateway
build_and_push "api-gateway" "./backend/api-gateway"

# 2. User Service
build_and_push "user-service" "./backend/user-service"

# 3. Post Service
build_and_push "post-service" "./backend/post-service"

# 4. Comment Service
build_and_push "comment-service" "./backend/comment-service"

# 5. Notification Service
build_and_push "notification-service" "./backend/notification-service"

# 6. Feed Service
build_and_push "feed-service" "./backend/feed-service"

echo -e "\n${GREEN}🎉 All Services Built and Pushed Successfully!${NC}"
