#!/bin/bash

# This script checks if the last workflow run for 'Test and Deploy' was successful.
# It requires 'jq' for JSON parsing and a GITHUB_TOKEN environment variable.
# You can install jq using: brew install jq (macOS) or sudo apt-get install jq (Ubuntu)
# Set your GITHUB_TOKEN: export GITHUB_TOKEN="YOUR_GITHUB_TOKEN"

OWNER="carlo-colombo"
REPO="cashsplitter"
WORKFLOW_NAME="Test and Deploy"

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN environment variable not set." >&2
  exit 1
fi

# Get workflow ID
WORKFLOW_ID=$(curl -s -H "Authorization: token $GITHUB_PERSONAL_ACCESS_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/workflows" | \
  jq -r ".workflows[] | select(.name == \"$WORKFLOW_NAME\") | .id")

if [ -z "$WORKFLOW_ID" ]; then
  echo "Error: Workflow '$WORKFLOW_NAME' not found." >&2
  exit 1
fi

# Get latest workflow run
LATEST_RUN_INFO=$(curl -s -H "Authorization: token $GITHUB_PERSONAL_ACCESS_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_ID/runs?per_page=1" | \
  jq -r ".workflow_runs[0]")

if [ "$LATEST_RUN_INFO" == "null" ]; then
  echo "No runs found for workflow '$WORKFLOW_NAME'."
  exit 0
fi

CONCLUSION=$(echo "$LATEST_RUN_INFO" | jq -r ".conclusion")
STATUS=$(echo "$LATEST_RUN_INFO" | jq -r ".status")

echo "Latest workflow run for '$WORKFLOW_NAME':"
echo "  Status: $STATUS"
echo "  Conclusion: $CONCLUSION"

if [ "$CONCLUSION" == "success" ]; then
  echo "The last workflow run was successful."
else
  echo "The last workflow run was NOT successful."
fi
