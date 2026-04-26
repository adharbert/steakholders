$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# Ensure devDependencies are installed (npm skips them when NODE_ENV=production)
$env:NODE_ENV = "development"

$backend  = $null
$frontend = $null

function Kill-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "==> Freeing port $Port (PID $($conn.OwningProcess))..."
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}

function Stop-Services {
    Write-Host ""
    Write-Host "Stopping Steakholders Meatup..."
    if ($null -ne $backend  -and !$backend.HasExited)  { taskkill /F /T /PID $backend.Id  2>$null | Out-Null }
    if ($null -ne $frontend -and !$frontend.HasExited) { taskkill /F /T /PID $frontend.Id 2>$null | Out-Null }
    Write-Host "Done."
}

try {
    Kill-Port 5000
    Kill-Port 5173

    Write-Host "==> Starting backend..."
    $backend = Start-Process -FilePath "dotnet" -ArgumentList "run" `
        -WorkingDirectory "$ROOT\backend\SteakholdersMeatup" `
        -PassThru -NoNewWindow

    Write-Host "==> Starting frontend..."
    $frontend = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" `
        -WorkingDirectory "$ROOT\frontend" `
        -PassThru -NoNewWindow

    Write-Host ""
    Write-Host "  Backend:  http://localhost:5000"
    Write-Host "  Swagger:  http://localhost:5000/swagger"
    Write-Host "  Frontend: http://localhost:5173"
    Write-Host ""
    Write-Host "Press Ctrl+C to stop."

    Wait-Process -Id $backend.Id, $frontend.Id
}
finally {
    Stop-Services
}
