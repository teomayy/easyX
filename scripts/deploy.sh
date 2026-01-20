#!/bin/bash
# Quick deploy script for EasyX

SERVER="root@5.182.26.71"
NAMESPACE="easyx-production"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Building images...${NC}"

# Build in parallel
docker build -f docker/Dockerfile.api -t ghcr.io/teomayy/easyx/api:latest . &
API_PID=$!
docker build -f docker/Dockerfile.admin -t ghcr.io/teomayy/easyx/admin:latest --build-arg NEXT_PUBLIC_API_URL=https://api.easyx.uz . &
ADMIN_PID=$!

wait $API_PID
wait $ADMIN_PID

echo -e "${YELLOW}Saving and copying images...${NC}"

# Save and copy in parallel
docker save ghcr.io/teomayy/easyx/api:latest | gzip | ssh $SERVER "gunzip | k3s ctr images import -" &
API_COPY=$!
docker save ghcr.io/teomayy/easyx/admin:latest | gzip | ssh $SERVER "gunzip | k3s ctr images import -" &
ADMIN_COPY=$!

wait $API_COPY
wait $ADMIN_COPY

echo -e "${YELLOW}Restarting deployments...${NC}"
ssh $SERVER "kubectl rollout restart deployment/easyx-prod-api deployment/easyx-prod-admin -n $NAMESPACE"

echo -e "${YELLOW}Waiting for rollout...${NC}"
ssh $SERVER "kubectl rollout status deployment/easyx-prod-api -n $NAMESPACE --timeout=120s"
ssh $SERVER "kubectl rollout status deployment/easyx-prod-admin -n $NAMESPACE --timeout=120s"

echo -e "${GREEN}Deploy complete!${NC}"
