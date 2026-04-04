#!/bin/bash

# Ensure we are in the correct directory
cd /app/workspace/projects/Versa

# Clear any broken merge state
git merge --abort || true

# Fetch the remote main branch
git fetch origin main

# Reset to adopt the remote timeline, keeping local files
git reset origin/main

# Add all local files
git add .

# Commit the changes
git commit -m "Automated Swarm Deployment: MVP Update"

# Push to main
git push origin main
