@echo off
title Ministry Staff Information Management System (SIMS)
echo ====================================================================
echo  Ministry of Housing, Construction and Water Supply - Sri Lanka
echo  Staff Information Management System Server
echo ====================================================================
echo.

set ELECTRON_RUN_AS_NODE=1
set NODE_EXE=C:\Users\User\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe

if exist "%NODE_EXE%" (
    echo Starting server with system Node environment...
    "%NODE_EXE%" "%~dp0server.js"
) else (
    echo Starting with standard node...
    node "%~dp0server.js"
)

pause

