@echo off
REM ==============================================================================
REM Skillify AI - Java Backend Runner Script
REM Executes the compiled Java Backend Server on port 8080.
REM ==============================================================================

setlocal enabledelayedexpansion
set "BACKEND_DIR=%~dp0"
if "%BACKEND_DIR:~-1%"=="\" set "BACKEND_DIR=%BACKEND_DIR:~0,-1%"

if not exist "%BACKEND_DIR%\bin\com\skillify\backend\SkillifyBackendServer.class" (
    echo [INFO] Binaries not found. Triggering build...
    call "%BACKEND_DIR%\build.bat"
)

echo [START] Launching Skillify Java Backend on port 8080...
java -cp "%BACKEND_DIR%\bin" com.skillify.backend.SkillifyBackendServer
