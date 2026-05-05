@echo off
REM ============================================================
REM EdLearn Backend Build & Setup Script for Windows
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          EdLearn Platform - Build Setup Script             ║
echo ║                   Windows Version                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check Prerequisites
echo [1/5] Checking prerequisites...
echo.

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found! Please install Java 17 or higher.
    echo    Download from: https://www.oracle.com/java/technologies/downloads/
    exit /b 1
) else (
    echo ✓ Java found
    java -version
)

echo.

REM Check Maven
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven not found! Please install Maven 3.6 or higher.
    echo    Download from: https://maven.apache.org/download.cgi
    exit /b 1
) else (
    echo ✓ Maven found
    mvn -version | findstr /R "Apache"
)

echo.

REM Check MySQL
mysql -u root -p -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ⚠ MySQL may not be running or root password not set
    echo   Make sure MySQL is running on localhost:3306
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "!continue!"=="y" exit /b 1
) else (
    echo ✓ MySQL is running
)

echo.
echo [2/5] Navigating to backend directory...
cd /d "%~dp0backend" 2>nul
if errorlevel 1 (
    echo ❌ Failed to navigate to backend directory
    exit /b 1
)
echo ✓ In backend directory

echo.
echo [3/5] Cleaning Maven cache and target directory...
call mvn clean >nul 2>&1
if exist target (
    rmdir /s /q target >nul 2>&1
)
echo ✓ Cleaned

echo.
echo [4/5] Building project...
echo.
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ❌ Build failed!
    echo    Check the error messages above.
    exit /b 1
)
echo ✓ Build successful

echo.
echo [5/5] Build setup complete!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                   NEXT STEPS                               ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║                                                            ║
echo ║  1. Setup Database (run in MySQL command line):           ║
echo ║     CREATE DATABASE edlearn_db;                           ║
echo ║     CREATE USER 'edlearn_user'@'localhost' IDENTIFIED     ║
echo ║       BY 'edlearn_pass';                                  ║
echo ║     GRANT ALL PRIVILEGES ON edlearn_db.* TO               ║
echo ║       'edlearn_user'@'localhost';                         ║
echo ║     FLUSH PRIVILEGES;                                     ║
echo ║                                                            ║
echo ║  2. Initialize Schema:                                    ║
echo ║     mysql -u edlearn_user -p edlearn_db                   ║
echo ║       < ..\docs\schema.sql                                ║
echo ║     (Password: edlearn_pass)                              ║
echo ║                                                            ║
echo ║  3. Run the application:                                  ║
echo ║     mvn spring-boot:run                                   ║
echo ║                                                            ║
echo ║  4. Access the API:                                       ║
echo ║     http://localhost:8080/api/swagger-ui.html             ║
echo ║     Login: admin / Admin@123                              ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
endlocal

