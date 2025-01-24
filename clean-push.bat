@echo off
echo Creating new clean branch...
git checkout -b clean-branch

echo Removing all files from git tracking...
git rm -r --cached .

echo Adding only necessary files...
git add app/
git add components/
git add lib/
git add public/
git add types/
git add AnimeModel/
git add "live2D chatbox preview images/"
git add .github/
git add next.config.js
git add package.json
git add package-lock.json
git add tsconfig.json
git add postcss.config.js
git add tailwind.config.ts
git add .eslintrc.json
git add components.json
git add .gitignore
git add README.md

echo Committing changes...
git commit -m "Clean repository structure"

echo Done! Review the changes with 'git status' then push with:
echo git push origin clean-branch
pause 