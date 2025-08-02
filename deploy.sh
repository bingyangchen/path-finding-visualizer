#!/usr/bin/env bash

git switch gh-pages
git rm -rf --ignore-unmatch assets/ js/ index.html style.css
git restore --source=main --staged --worktree -- assets/ js/ index.html style.css
git add -A
git commit -m "deploy"
git push origin gh-pages
git switch main