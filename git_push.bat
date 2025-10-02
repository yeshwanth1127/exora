@echo off
echo Adding all changes...
git add .

echo Committing changes...
git commit -m "new"

echo Pushing to origin master...
git push origin master

echo Done!
pause
