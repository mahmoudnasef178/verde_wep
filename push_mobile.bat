@echo off
set GIT_EXE="C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
cd /d "f:\Verde Wep\verde-web"
%GIT_EXE% add .
%GIT_EXE% commit -m "fix(mobile): complete mobile UI responsiveness across navbar, hero, products grid, cart drawer, and product pages"
%GIT_EXE% push origin main
del push_mobile.bat
