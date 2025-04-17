#!/bin/bash
set -e

# Set variables
# TODO: get graze out of the naems here
BACKEND_CONTAINER="graze-backend-1"
CONTAINER_PATH="/app/app/alembic/versions"
HOST_PATH="$HOME/graze/backend/app/alembic/versions"

# Create host directory if it doesn't exist
mkdir -p "$HOST_PATH"

# Copy files from container to host
# echo "Copying alembic versions from $BACKEND_CONTAINER:$CONTAINER_PATH to $HOST_PATH..."
docker cp "$BACKEND_CONTAINER:$CONTAINER_PATH/." "$HOST_PATH"

# echo "Copy complete. Alembic versions are now in $HOST_PATH" 