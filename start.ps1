#Requires -Version 5.1
<#
.SYNOPSIS
  Hackathon Hub launcher for native Windows (PowerShell 5.1+).
  Companion to start.sh — same jobs, no WSL/Git Bash required:
  creates .env files, bootstraps PostgreSQL (local or Docker Desktop),
  installs dependencies, runs migrations/seeds, starts backend + frontend,
  waits for health checks, and tears everything down on Ctrl+C.

.DESCRIPTION
  Not replicated from start.sh: crash-supervisor, health monitor and
  config watcher (bash-specific). Vite HMR and tsx watch cover hot reload;
  if a service dies, rerun this script.

  Run:  powershell -ExecutionPolicy Bypass -File .\start.ps1 [options]
        .\start.ps1  (when execution policy allows)

.EXAMPLE
  .\start.ps1 -Prod          # build + production mode
  .\start.ps1 -NoSeed        # skip seeding
  .\start.ps1 -DockerDb      # force PostgreSQL via Docker

.NOTES
  Options map 1:1 to start.sh flags:
    -NoDb      skip database setup (external DB already running)
    -DockerDb  force PostgreSQL via Docker
    -NoSeed    skip database seeding
    -Prod      production mode (build + start)
    -Help      show help
  Environment overrides: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD,
  BACKEND_PORT, FRONTEND_PORT (defaults: localhost, 5432, postgres,
  postgres, 5000, 5173)
#>
param(
    [switch]$NoDb,
    [switch]$DockerDb,
    [switch]$NoSeed,
    [switch]$Prod,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir   = Join-Path $ProjectRoot "server"
$ClientDir   = Join-Path $ProjectRoot "client"
$LogDir      = Join-Path $ProjectRoot "logs"

$DbName     = "hackathon_hub"
$DbUser     = if ($env:DB_USER)     { $env:DB_USER }     else { "postgres" }
$DbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
$DbHost     = if ($env:DB_HOST)     { $env:DB_HOST }     else { "localhost" }
$DbPort     = if ($env:DB_PORT)     { [int]$env:DB_PORT } else { 5432 }
$BackendPort  = if ($env:BACKEND_PORT)  { [int]$env:BACKEND_PORT }  else { 5000 }
$FrontendPort = if ($env:FRONTEND_PORT) { [int]$env:FRONTEND_PORT } else { 5173 }

$DockerContainer = "hackathon-hub-postgres"
$DockerImage     = "postgres:16-alpine"

$script:Procs            = @()
$script:SavedEnv         = @{}
$script:DockerUsed       = $false

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

# ---------------------------------------------------------------------------
function Write-Step    { param($t) Write-Host "`n==== $t ====" -ForegroundColor Cyan }
function Write-Info    { param($t) Write-Host "[INFO]  $t" }
function Write-Success { param($t) Write-Host "[OK]    $t" -ForegroundColor Green }
function Write-Caution { param($t) Write-Host "[WARN]  $t" -ForegroundColor Yellow }
function Write-Fail    { param($t) Write-Host "[ERROR] $t" -ForegroundColor Red }

function Set-ChildEnv {
    param([string]$Name, [string]$Value)
    if (-not $script:SavedEnv.ContainsKey($Name)) {
        $script:SavedEnv[$Name] = [Environment]::GetEnvironmentVariable($Name)
    }
    [Environment]::SetEnvironmentVariable($Name, $Value)
}

function Test-TcpPort {
    param([string]$TargetHost, [int]$TargetPort)
    $client = New-Object Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect($TargetHost, $TargetPort, $null, $null)
        if (-not $async.AsyncWaitHandle.WaitOne(800)) { return $false }
        $client.EndConnect($async)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

function Initialize-EnvFiles {
    Write-Step "Setting up environment files"
    foreach ($dir in @($ProjectRoot, $ServerDir, $ClientDir)) {
        $envFile    = Join-Path $dir ".env"
        $envExample = Join-Path $dir ".env.example"
        if ((-not (Test-Path $envFile)) -and (Test-Path $envExample)) {
            Copy-Item $envExample $envFile
            Write-Success "Created $envFile"
        } elseif (Test-Path $envFile) {
            Write-Success "$envFile already exists"
        }
    }
}

function Assert-Prerequisites {
    Write-Step "Checking prerequisites"
    foreach ($tool in @("node", "npm")) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            throw "$tool not found. Install Node.js LTS from https://nodejs.org/"
        }
    }
    $nodeMajor = [int](((& node --version) -replace "^v", "").Split(".")[0])
    if ($nodeMajor -lt 18) { throw "Node.js >= 18 required (found v$nodeMajor)" }
    $npmVersion = (& npm --version)
    $npmMajor = [int]($npmVersion.Split(".")[0])
    if ($npmMajor -lt 9) { throw "npm >= 9 required (found $npmVersion)" }
    Write-Success "node $(node --version), npm $(npm --version)"
}

function Ensure-DockerPostgres {
    # NOTE: native stderr must be merged (2>&1), not discarded (2>$null) —
    # under $ErrorActionPreference='Stop' the latter throws on any output.
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Desktop is not running. Start it, or install PostgreSQL locally."
    }
    $names = @(docker ps -a --format "{{.Names}}")
    if ($names -contains $DockerContainer) {
        Write-Info "Starting existing container $DockerContainer..."
        docker start $DockerContainer | Out-Null
    } else {
        Write-Info "Creating PostgreSQL container $DockerContainer..."
        docker run -d --name $DockerContainer `
            -e POSTGRES_DB=$DbName -e POSTGRES_USER=$DbUser -e POSTGRES_PASSWORD=$DbPassword `
            -p "${DbPort}:5432" $DockerImage | Out-Null
    }
    $script:DockerUsed = $true

    Write-Info "Waiting for PostgreSQL to be ready..."
    for ($i = 1; $i -le 30; $i++) {
        docker exec $DockerContainer pg_isready -U $DbUser -q 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready in Docker"
            return
        }
        Start-Sleep -Seconds 1
    }
    throw "PostgreSQL in Docker did not become ready in time"
}

function Ensure-Database {
    Write-Step "Checking PostgreSQL at ${DbHost}:${DbPort}"
    $localAvailable = Test-TcpPort $DbHost $DbPort

    if ($DockerDb -or -not $localAvailable) {
        if ($localAvailable) { Write-Caution "Forcing Docker (--DockerDb) although something listens on $DbPort" }
        Ensure-DockerPostgres
        Set-ChildEnv "DATABASE_URL" "postgresql://${DbUser}:${DbPassword}@${DbHost}:${DbPort}/${DbName}"

        $exists = docker exec $DockerContainer psql -U $DbUser -tAc `
            "SELECT 1 FROM pg_database WHERE datname='$DbName'"
        if ("$exists".Trim() -eq "1") {
            Write-Success "Database '$DbName' already exists"
        } else {
            Write-Info "Creating database '$DbName'..."
            docker exec $DockerContainer psql -U $DbUser -c "CREATE DATABASE `"$DbName`"" 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Failed to create database '$DbName'" }
            Write-Success "Database '$DbName' created"
        }
        return
    }

    Write-Success "Something is listening on ${DbHost}:${DbPort} - assuming local PostgreSQL"
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        $env:PGPASSWORD = $DbPassword
        # no redirection here: stdout feeds $exists, and unredirected native
        # stderr does not trip $ErrorActionPreference in Windows PowerShell 5.1
        $exists = psql -h $DbHost -p $DbPort -U $DbUser -tAc `
            "SELECT 1 FROM pg_database WHERE datname='$DbName'"
        if ($LASTEXITCODE -ne 0 -or "$exists".Trim() -ne "1") {
            Write-Info "Creating database '$DbName'..."
            psql -h $DbHost -p $DbPort -U $DbUser -c "CREATE DATABASE `"$DbName`""
            if ($LASTEXITCODE -ne 0) { throw "Failed to create database. Or run .\start.ps1 -DockerDb" }
        }
        Write-Success "Database '$DbName' ready"
    } else {
        Write-Caution "psql not found - cannot create/verify '$DbName'. Assuming it exists."
        Write-Caution "Tip: install PostgreSQL client tools, or use -DockerDb."
    }
}

function Invoke-Npm {
    param([string]$WorkDir, [string[]]$NpmArgs, [string]$Label)
    Push-Location $WorkDir
    try {
        Write-Info "npm $($NpmArgs -join ' ')  ($Label)"
        & npm @NpmArgs
        if ($LASTEXITCODE -ne 0) { throw "$Label failed: npm $($NpmArgs -join ' ')" }
    } finally {
        Pop-Location
    }
}

function Install-Dependencies {
    param([string]$WorkDir, [string]$Label)
    Write-Step "Installing $Label dependencies"
    $lock = Join-Path $WorkDir "package-lock.json"
    $npmArgs = if (Test-Path $lock) { @("ci") } else { @("install") }
    Invoke-Npm -WorkDir $WorkDir -NpmArgs $npmArgs -Label "$Label dependencies"
    Write-Success "$Label dependencies installed"
}

function Start-HubProcess {
    param([string]$Name, [string]$WorkDir, [string[]]$ProcArgs, [hashtable]$ExtraEnv = @{})
    foreach ($key in $ExtraEnv.Keys) { Set-ChildEnv $key $ExtraEnv[$key] }
    $outLog = Join-Path $LogDir "$Name.out.log"
    $errLog = Join-Path $LogDir "$Name.err.log"
    $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c $($ProcArgs -join ' ')" `
        -WorkingDirectory $WorkDir `
        -RedirectStandardOutput $outLog -RedirectStandardError $errLog `
        -WindowStyle Hidden -PassThru
    $script:Procs += @{ Name = $Name; Proc = $proc; OutLog = $outLog; ErrLog = $errLog }
    Write-Success "$Name started (pid $($proc.Id), log: logs\$Name.out.log)"
}

function Wait-Healthy {
    param([string]$Url, [string]$Name, [int]$TimeoutSeconds = 60)
    Write-Info "Waiting for $Name at $Url ..."
    for ($i = 1; $i -le $TimeoutSeconds; $i++) {
        if ($script:Procs | Where-Object { $_.Proc.HasExited }) {
            throw "$Name process exited during startup - see logs\"
        }
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 | Out-Null
            Write-Success "$Name is ready"
            return
        } catch { Start-Sleep -Seconds 1 }
    }
    foreach ($entry in $script:Procs) {
        Write-Fail "--- tail $($entry.Name).out.log ---"
        Get-Content $entry.OutLog -Tail 15 -ErrorAction SilentlyContinue
    }
    throw "$Name did not become healthy within ${TimeoutSeconds}s"
}

function Stop-HubProcesses {
    foreach ($entry in $script:Procs) {
        if (-not $entry.Proc.HasExited) {
            # /T kills the whole child tree (npm -> node -> tsx/vite)
            taskkill /T /F /PID $entry.Proc.Id 2>&1 | Out-Null
        }
    }
    $script:Procs = @()
}

function Restore-ChildEnv {
    foreach ($key in $script:SavedEnv.Keys) {
        [Environment]::SetEnvironmentVariable($key, $script:SavedEnv[$key])
    }
}

function Remove-DockerIfNeeded {
    if ($script:DockerUsed) {
        Write-Info "Stopping Docker PostgreSQL container..."
        docker stop $DockerContainer 2>&1 | Out-Null
        docker rm $DockerContainer 2>&1 | Out-Null
    }
}

function Show-Help {
    Write-Host @"
Hackathon Hub launcher (native Windows)

Usage: powershell -ExecutionPolicy Bypass -File .\start.ps1 [options]

Options:
  -NoDb      Skip database setup (external database)
  -DockerDb  Force PostgreSQL via Docker
  -NoSeed    Skip database seeding
  -Prod      Production mode (build + start)
  -Help      Show this help

Environment: DB_HOST DB_PORT DB_USER DB_PASSWORD BACKEND_PORT FRONTEND_PORT
Logs: logs\backend.out.log / logs\frontend.out.log (plus .err.log)
"@ -ForegroundColor Cyan
}

# ---------------------------------------------------------------------------
try {
    if ($Help) { Show-Help; return }

    $mode = if ($Prod) { "PRODUCTION" } else { "DEVELOPMENT" }
    Write-Host ""
    Write-Host "== Hackathon Hub - starting ($mode mode) ==" -ForegroundColor Cyan

    Assert-Prerequisites
    Initialize-EnvFiles

    if (-not $NoDb) { Ensure-Database }
    else { Write-Caution "Skipping database setup (-NoDb)" }

    Install-Dependencies -WorkDir $ServerDir -Label "backend"
    Install-Dependencies -WorkDir $ClientDir -Label "frontend"

    if ($Prod) {
        Write-Step "Building for production"
        Invoke-Npm -WorkDir $ServerDir -NpmArgs @("run", "build") -Label "backend build"
        Invoke-Npm -WorkDir $ClientDir -NpmArgs @("run", "build") -Label "frontend build"
    }

    Write-Step "Starting backend on port $BackendPort"
    $backendArgs = if ($Prod) { @("node", "dist\index.js") } else { @("npm", "run", "dev") }
    $backendEnv = @{ PORT = "$BackendPort"; NODE_ENV = $(if ($Prod) { "production" } else { "development" }) }
    Start-HubProcess -Name "backend" -WorkDir $ServerDir -ProcArgs $backendArgs -ExtraEnv $backendEnv
    Wait-Healthy -Url "http://localhost:$BackendPort/api/v1/health" -Name "Backend API"

    Write-Step "Starting frontend on port $FrontendPort"
    $frontendArgs = if ($Prod) { @("npm", "run", "preview") } else { @("npm", "run", "dev") }
    Start-HubProcess -Name "frontend" -WorkDir $ClientDir -ProcArgs $frontendArgs -ExtraEnv @{ PORT = "$FrontendPort" }
    Wait-Healthy -Url "http://localhost:$FrontendPort" -Name "Frontend"

    Write-Host ""
    Write-Host "== All services started ==" -ForegroundColor Green
    Write-Host "   Frontend:     http://localhost:$FrontendPort/"
    Write-Host "   Backend API:  http://localhost:$BackendPort/api/v1/health"
    Write-Host "   Demo login:   admin@hackathon.com / admin123"
    Write-Host "   Logs:         logs\backend.*.log, logs\frontend.*.log"
    Write-Host "   Press Ctrl+C to stop all services" -ForegroundColor Yellow
    Write-Host ""

    while ($true) {
        Start-Sleep -Seconds 2
        $dead = $script:Procs | Where-Object { $_.Proc.HasExited }
        if ($dead) {
            foreach ($d in $dead) { Write-Fail "$($d.Name) exited unexpectedly - see logs\" }
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "Shutting down services..." -ForegroundColor Yellow
    Stop-HubProcesses
    Remove-DockerIfNeeded
    Restore-ChildEnv
    Write-Host "All services stopped." -ForegroundColor Green
}
