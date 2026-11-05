@echo off
title Launch Ministry Staff Information Management System
echo ====================================================================
echo  Opening Ministry Staff Information Management System (SIMS)...
echo ====================================================================

REM Open browser to public submission portal
start http://localhost:3000/

echo.
echo Application opened in your default web browser!
echo URL: http://localhost:3000/
echo Admin PIN: admin123 or ministry@2026
echo.
timeout /t 3 >nul

