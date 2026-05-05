# ============================================================
# EdLearn Backend Build & Setup Script for PowerShell
# ============================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          EdLearn Platform - Build Setup Script             ║" -ForegroundColor Cyan
Write-Host "║                   PowerShell Version                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Prerequisites
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✓ Java found" -ForegroundColor Green
    Write-Host $javaVersion
} catch {
    Write-Host "❌ Java not found! Please install Java 17 or higher." -ForegroundColor Red
    Write-Host "   Download from: https://www.oracle.com/java/technologies/downloads/"
    exit 1
}

Write-Host ""

# Check Maven
try {
    $mavenVersion = mvn -version 2>&1 | Select-String "Apache Maven"
    Write-Host "✓ Maven found" -ForegroundColor Green
    Write-Host $mavenVersion
} catch {
    Write-Host "❌ Maven not found! Please install Maven 3.6 or higher." -ForegroundColor Red
    Write-Host "   Download from: https://maven.apache.org/download.cgi"
    exit 1
}

Write-Host ""

# Check MySQL
try {
    mysql -u root -p -e "SELECT 1;" 2>&1 | Out-Null
    Write-Host "✓ MySQL is running" -ForegroundColor Green
} catch {
    Write-Host "⚠ MySQL may not be running or root password not set" -ForegroundColor Yellow
    Write-Host "  Make sure MySQL is running on localhost:3306"
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "[2/5] Navigating to backend directory..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "."
Push-Location $backendPath
Write-Host "✓ In backend directory" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Cleaning Maven cache and target directory..." -ForegroundColor Yellow
mvn clean 2>&1 | Out-Null
if (Test-Path "target") {
    Remove-Item -Path "target" -Recurse -Force 2>&1 | Out-Null
}
Write-Host "✓ Cleaned" -ForegroundColor Green

Write-Host ""
Write-Host "[4/5] Building project..." -ForegroundColor Yellow
Write-Host ""
mvn clean install -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "   Check the error messages above." -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Build setup complete!" -ForegroundColor Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   NEXT STEPS                               ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  1. Setup Database (run in MySQL command line):           ║" -ForegroundColor Cyan
Write-Host "║     CREATE DATABASE edlearn_db;                           ║" -ForegroundColor Cyan
Write-Host "║     CREATE USER 'edlearn_user'@'localhost' IDENTIFIED     ║" -ForegroundColor Cyan
Write-Host "║       BY 'edlearn_pass';                                  ║" -ForegroundColor Cyan
Write-Host "║     GRANT ALL PRIVILEGES ON edlearn_db.* TO               ║" -ForegroundColor Cyan
Write-Host "║       'edlearn_user'@'localhost';                         ║" -ForegroundColor Cyan
Write-Host "║     FLUSH PRIVILEGES;                                     ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  2. Initialize Schema:                                    ║" -ForegroundColor Cyan
Write-Host "║     mysql -u edlearn_user -p edlearn_db < ..\docs\schema.sql" -ForegroundColor Cyan
Write-Host "║     (Password: edlearn_pass)                              ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  3. Run the application:                                  ║" -ForegroundColor Cyan
Write-Host "║     mvn spring-boot:run                                   ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║  4. Access the API:                                       ║" -ForegroundColor Cyan
Write-Host "║     http://localhost:8080/api/swagger-ui.html             ║" -ForegroundColor Cyan
Write-Host "║     Login: admin / Admin@123                              ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Pop-Location
Read-Host "Press Enter to continue"

