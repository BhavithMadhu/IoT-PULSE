# IoT PULSE — Concurrent Dev Server Launcher (PowerShell / Windows)
# Starts FastAPI backend (port 8000) and Vite frontend (port 5173)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  IoT PULSE — Cybersecurity Analytics Platform" -ForegroundColor Cyan
Write-Host "  Foundations of Data Science Case Study (RT-IOT2022)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
} -ArgumentList $ScriptDir

# Wait for backend health
Write-Host "Waiting for backend initialization..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 35; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($res.status -eq "healthy") {
            Write-Host "Backend is healthy and ready!" -ForegroundColor Green
            $healthy = $true
            break
        }
    } catch {
        # still initializing
    }
    Start-Sleep -Seconds 1
}

if (-not $healthy) {
    Write-Host "Backend took longer than expected to start, checking logs..." -ForegroundColor Red
    Receive-Job -Job $backendJob -Keep
}

# Start Frontend
Write-Host "Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm --prefix frontend run dev -- --host 0.0.0.0
} -ArgumentList $ScriptDir

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  System Live & Accessible:" -ForegroundColor Cyan
Write-Host "  - Web Dashboard:     http://localhost:5173" -ForegroundColor White
Write-Host "  - FastAPI Swagger:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Health Endpoint:   http://localhost:8000/api/health" -ForegroundColor White
Write-Host "  - Curated Exports:   $ScriptDir\exports\" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Press CTRL+C or run Stop-Job to stop background server jobs." -ForegroundColor DarkGray

try {
    while ($true) {
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "`nStopping IoT PULSE servers..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
}
