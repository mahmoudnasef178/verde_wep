@echo off
set GIT_EXE="C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
cd /d "f:\Verde Wep\verde-web"
if exist first_commit.bat del first_commit.bat
if exist push_git.bat del push_git.bat

%GIT_EXE% add .
%GIT_EXE% commit -m "feat: complete Verde Web luxury perfume ecommerce frontend"
%GIT_EXE% push origin main
