#!/usr/bin/env bash

git switch main
npm run build

cp -r js/ /tmp/main_js_backup
cp style.css /tmp/main_style_backup.css

git switch gh-pages
git show main:index.html > index.html

rm -rf assets/
git checkout main -- assets/

rm -rf js/
cp -r /tmp/main_js_backup js/

cp /tmp/main_style_backup.css style.css

git add -A
git commit -m "deploy"
git push origin gh-pages

git switch main
cp -r /tmp/main_js_backup js/
cp /tmp/main_style_backup.css style.css

rm -rf /tmp/main_js_backup
rm /tmp/main_style_backup.css
