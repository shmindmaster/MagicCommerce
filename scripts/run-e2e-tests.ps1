# MagicCommerce E2E Test Runner
# This script runs comprehensive end-to-end tests using Playwright and validates API endpoints

param(
  [string]$Environment = "dev",
  [switch]$SkipBuild,
  [switch]$SkipPlaywright,
  [switch]$HeadlessMode = $true,
  [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " MagicCommerce E2E Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:BASE_URL = $BaseUrl
$env:NODE_ENV = $Environment

# Function to check if app is running
function Test-AppRunning {
  try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    return $response.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

# Function to wait for app to be ready
function Wait-AppReady {
  param([int]$MaxAttempts = 30)

  Write-Host "Waiting for application to be ready..." -ForegroundColor Yellow
  $attempts = 0

  while ($attempts -lt $MaxAttempts) {
    if (Test-AppRunning) {
      Write-Host "✓ Application is ready!" -ForegroundColor Green
      return $true
    }

    $attempts++
    Write-Host "  Attempt $attempts/$MaxAttempts - Waiting 2 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
  }

  Write-Host "✗ Application failed to start after $MaxAttempts attempts" -ForegroundColor Red
  return $false
}

# Step 1: Build the application (if not skipped)
if (-not $SkipBuild) {
  Write-Host "`n[1/4] Building application..." -ForegroundColor Cyan
  Write-Host "--------------------------------------" -ForegroundColor Gray

  # Install dependencies
  Write-Host "Installing dependencies with pnpm..." -ForegroundColor Yellow
  pnpm install

  if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
  }

  # Generate Prisma client
  Write-Host "Generating Prisma client..." -ForegroundColor Yellow
  pnpm exec prisma generate

  if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
  }

  # Build Next.js
  Write-Host "Building Next.js application..." -ForegroundColor Yellow
  pnpm run build

  if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
  }

  Write-Host "✓ Build completed successfully" -ForegroundColor Green
}
else {
  Write-Host "`n[1/4] Skipping build step" -ForegroundColor Yellow
}

# Step 2: Start the application
Write-Host "`n[2/4] Starting application server..." -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Gray

$appProcess = $null

if (-not (Test-AppRunning)) {
  Write-Host "Starting Next.js server on $BaseUrl..." -ForegroundColor Yellow

  # Start the app in background
  $appProcess = Start-Process -FilePath "pnpm" -ArgumentList "start" -PassThru -NoNewWindow

  # Wait for app to be ready
  if (-not (Wait-AppReady)) {
    Write-Host "✗ Failed to start application" -ForegroundColor Red
    if ($appProcess) {
      Stop-Process -Id $appProcess.Id -Force
    }
    exit 1
  }
}
else {
  Write-Host "✓ Application is already running" -ForegroundColor Green
}

# Step 3: Run API Health Checks
Write-Host "`n[3/4] Running API health checks..." -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Gray

try {
  $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET

  if ($healthResponse.status -eq "healthy") {
    Write-Host "✓ API Health: $($healthResponse.status)" -ForegroundColor Green

    if ($healthResponse.database) {
      Write-Host "  Database: $($healthResponse.database)" -ForegroundColor Gray
    }
    if ($healthResponse.azureOpenAI) {
      Write-Host "  Azure OpenAI: $($healthResponse.azureOpenAI)" -ForegroundColor Gray
    }
    if ($healthResponse.azureSearch) {
      Write-Host "  Azure Search: $($healthResponse.azureSearch)" -ForegroundColor Gray
    }
  }
  else {
    Write-Host "⚠ API Health: $($healthResponse.status)" -ForegroundColor Yellow
  }
}
catch {
  Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

# Test Products API
Write-Host "`nTesting Products API..." -ForegroundColor Yellow
try {
  $productsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/products" -Method GET

  if ($productsResponse -is [array]) {
    Write-Host "✓ Products API: Retrieved $($productsResponse.Count) products" -ForegroundColor Green

    if ($productsResponse.Count -gt 0) {
      $testProductId = $productsResponse[0].id
      Write-Host "  Test Product ID: $testProductId" -ForegroundColor Gray

      # Test individual product
      $productResponse = Invoke-RestMethod -Uri "$BaseUrl/api/product/$testProductId" -Method GET
      Write-Host "✓ Product Detail: Retrieved product '$($productResponse.title)'" -ForegroundColor Green
    }
  }
}
catch {
  Write-Host "✗ Products API test failed: $_" -ForegroundColor Red
}

# Step 4: Run Playwright E2E Tests (if not skipped)
if (-not $SkipPlaywright) {
  Write-Host "`n[4/4] Running Playwright E2E tests..." -ForegroundColor Cyan
  Write-Host "--------------------------------------" -ForegroundColor Gray

  $playwrightArgs = @("test")

  if ($HeadlessMode) {
    $playwrightArgs += "--headed=false"
  }
  else {
    $playwrightArgs += "--headed"
  }

  Write-Host "Executing: pnpm exec playwright $($playwrightArgs -join ' ')" -ForegroundColor Yellow
  pnpm exec playwright @playwrightArgs

  $playwrightExitCode = $LASTEXITCODE

  if ($playwrightExitCode -eq 0) {
    Write-Host "✓ Playwright tests passed" -ForegroundColor Green
  }
  else {
    Write-Host "✗ Playwright tests failed with exit code $playwrightExitCode" -ForegroundColor Red
  }

  # Generate report
  Write-Host "`nGenerating test report..." -ForegroundColor Yellow
  pnpm exec playwright show-report --host 0.0.0.0
}
else {
  Write-Host "`n[4/4] Skipping Playwright tests" -ForegroundColor Yellow
}

# Cleanup
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host " Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($appProcess -and -not $appProcess.HasExited) {
  Write-Host "`nStopping application server..." -ForegroundColor Yellow
  Stop-Process -Id $appProcess.Id -Force
  Write-Host "✓ Server stopped" -ForegroundColor Green
}

Write-Host "`n✓ E2E test suite completed" -ForegroundColor Green
Write-Host ""

# Exit with appropriate code
if (-not $SkipPlaywright -and $playwrightExitCode -ne 0) {
  exit $playwrightExitCode
}

exit 0
