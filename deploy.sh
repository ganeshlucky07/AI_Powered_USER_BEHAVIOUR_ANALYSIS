#!/bin/bash

# Render Deployment Script for Risk Score Engine
# This script helps deploy all services to Render

echo "🚀 Risk Score Engine - Render Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Prerequisites:${NC}"
echo "1. Render CLI installed: npm install -g @render/cli"
echo "2. Logged in to Render: render login"
echo "3. Git repository pushed to GitHub"
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo -e "${RED}Error: Render CLI is not installed${NC}"
    echo "Install with: npm install -g @render/cli"
    exit 1
fi

# Check if user is logged in
if ! render whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Render${NC}"
    echo "Login with: render login"
    exit 1
fi

echo -e "${GREEN}✓ Render CLI is installed and authenticated${NC}"
echo ""

# Deployment steps
echo "${YELLOW}Deployment Steps:${NC}"
echo ""

echo "Step 1: Deploy AI Service"
echo "-----------------------"
echo "Service: risk-ai-service"
echo "Type: Web Service (Python)"
echo "Build: pip install -r requirements.txt && python train_model.py"
echo "Start: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo ""

echo "Step 2: Deploy Backend"
echo "----------------------"
echo "Service: risk-backend"
echo "Type: Web Service (Java)"
echo "Build: mvn clean package -DskipTests"
echo "Start: java -jar target/risk-score-engine-1.0.0.jar"
echo ""
echo "Environment Variables Required:"
echo "  - DB_URL (MySQL connection string)"
echo "  - DB_USERNAME"
echo "  - DB_PASSWORD"
echo "  - AI_SERVICE_URL (from Step 1)"
echo ""

echo "Step 3: Deploy Frontend"
echo "-----------------------"
echo "Service: risk-frontend"
echo "Type: Static Site"
echo "Build: npm install && npm run build"
echo "Publish: build/"
echo ""
echo "Environment Variables Required:"
echo "  - REACT_APP_API_URL (from Step 2)"
echo ""

echo "${YELLOW}Manual Deployment Instructions:${NC}"
echo ""
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New +' and select 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will auto-detect render.yaml files"
echo "5. Deploy in this order: AI Service → Backend → Frontend"
echo ""

echo "${GREEN}Deployment Complete!${NC}"
echo ""
echo "Post-Deployment:"
echo "1. Get AI Service URL and set as AI_SERVICE_URL in Backend"
echo "2. Get Backend URL and set as REACT_APP_API_URL in Frontend"
echo "3. Configure MySQL database credentials in Backend"
echo ""
