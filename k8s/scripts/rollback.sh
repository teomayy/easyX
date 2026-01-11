#!/bin/bash
set -euo pipefail

# EasyX Rollback Script

ENVIRONMENT=${1:-staging}
REVISION=${2:-}
NAMESPACE="easyx-${ENVIRONMENT}"

echo "Rolling back EasyX in ${ENVIRONMENT}..."

if [[ -n "$REVISION" ]]; then
    echo "Rolling back to revision: ${REVISION}"
    helm rollback easyx "$REVISION" -n "$NAMESPACE"
else
    echo "Rolling back to previous revision..."
    helm rollback easyx -n "$NAMESPACE"
fi

# Verify rollback
echo "Verifying rollback..."
kubectl rollout status deployment/easyx-api -n "$NAMESPACE"
kubectl rollout status deployment/easyx-web -n "$NAMESPACE"

echo ""
echo "Rollback complete!"
echo ""
helm history easyx -n "$NAMESPACE" --max 5
