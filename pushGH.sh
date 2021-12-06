#!/usr/bin/env sh

# abort on errors
set -e

echo -n "Commit message: "
read message

git add .
git commit -m "$message"

echo Pushing to Github repository
git push -u origin main
