#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="./.env"
TEMPLATE="./project.yml.template"
OUTPUT="./project.yml"

if [[ ! -f $ENV_FILE ]]; then
  echo "❌ Missing .env file in the current directory."
  exit 1
fi

# Load environment variables safely
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^\s*# ]] && continue
  [[ -z "$key" ]] && continue

  # Trim whitespace and export
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  export "$key=$value"
done < "$ENV_FILE"

# Render the template with current env
envsubst < "$TEMPLATE" > "$OUTPUT"

echo "✅ Generated: $OUTPUT"
