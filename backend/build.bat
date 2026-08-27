@echo off
REM ==============================================================================
REM Skillify AI - Java Backend Build Script
REM ==============================================================================

setlocal enabledelayedexpansion
set "BACKEND_DIR=%~dp0"
if "%BACKEND_DIR:~-1%"=="\" set "BACKEND_DIR=%BACKEND_DIR:~0,-1%"

if not exist "%BACKEND_DIR%\bin" mkdir "%BACKEND_DIR%\bin"

set "SRC_LIST=%TEMP%\skillify_java_sources_%RANDOM%.txt"
if exist "%SRC_LIST%" del "%SRC_LIST%"

for /r "%BACKEND_DIR%\src\main\java" %%f in (*.java) do (
    set "FILE_PATH=%%f"
    set "FILE_PATH=!FILE_PATH:\=/!"
    echo "!FILE_PATH!" >> "%SRC_LIST%"
)

javac -encoding UTF-8 -d "%BACKEND_DIR%\bin" @"%SRC_LIST%"
set "ERR=%ERRORLEVEL%"
if exist "%SRC_LIST%" del "%SRC_LIST%"

if %ERR% EQU 0 (
    echo [SUCCESS] Java Backend compiled successfully into backend\bin.
) else (
    echo [ERROR] Java compilation failed with error code %ERR%.
    exit /b %ERR%
)
