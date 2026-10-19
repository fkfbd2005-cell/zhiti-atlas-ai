@echo off
chcp 65001 >nul 2>nul
title Zhiti Atlas AI
cd /d "%~dp0"

echo.
echo   Zhiti . Atlas AI
echo   Starting, please wait...
echo.

where node >nul 2>nul
if errorlevel 1 goto :no_node

node "%~dp0scripts\launch.mjs" %*
set "EXITCODE=%ERRORLEVEL%"

if "%EXITCODE%"=="0" goto :end

echo.
echo   Startup failed with exit code %EXITCODE%
echo.
pause
goto :end

:no_node
echo   [X] Node.js not found
echo.
echo   Please install Node.js 22.13 or newer:
echo     https://nodejs.org
echo.
echo   Then double-click this file again.
echo.
pause

:end
endlocal
