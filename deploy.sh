#!/usr/bin/env bash

npm run build
git stash push -m "built artifact" -- assets/ js/ index.html style.css
git switch gh-pages
git rm -rf --ignore-unmatch assets/ js/ index.html style.css
git stash pop
git add -A
git commit -m "deploy"
git push origin gh-pages
git switch main