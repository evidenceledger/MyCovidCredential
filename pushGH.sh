#!/usr/bin/env sh

# abort on errors
set -e

git add .
git commit -m 'deploy'

echo Pushing to Github repository
git push -u origin main

