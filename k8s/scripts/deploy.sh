#!/bin/bash
set -euo pipefail

# EasyX Deployment Script

ENVIRONMENT=${1:-staging}
NAMESPACE="easyx-${ENVIRONMENT}"
CHART_PATH="./k8s/charts/easyx"

echo "Deploying EasyX to ${ENVIRONMENT}..."

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "Error: helm is not installed"
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: kubectl is not configured or cluster is not reachable"
    exit 1
fi

# Update dependencies
echo "Updating Helm dependencies..."
helm dependency update "$CHART_PATH"

# Deploy
echo "Deploying to namespace: ${NAMESPACE}"
helm upgrade --install easyx "$CHART_PATH" \
    --namespace "$NAMESPACE" \
    --create-namespace \
    --values "${CHART_PATH}/values-${ENVIRONMENT}.yaml" \
    --wait \
    --timeout 10m

# Verify deployment
echo "Verifying deployment..."
kubectl rollout status deployment/easyx-api -n "$NAMESPACE"
kubectl rollout status deployment/easyx-web -n "$NAMESPACE"
kubectl rollout status deployment/easyx-admin -n "$NAMESPACE"

echo ""
echo "Deployment complete!"
echo ""
kubectl get pods -n "$NAMESPACE"
