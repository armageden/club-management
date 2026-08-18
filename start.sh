#!/usr/bin/env bash
# =============================================================================
# Hackathon Hub - Universal Start Script
# Works on Linux, macOS, Windows (WSL/Git Bash/PowerShell)
# =============================================================================
#
# Features:
# - Auto-detects OS and package manager
# - Creates .env files from templates if missing
# - Validates prerequisites (Node.js, npm, PostgreSQL)
# - Starts PostgreSQL via Docker if not available locally
# - Runs database migrations and seeds
# - Starts backend and frontend with health checks
# - Graceful shutdown on Ctrl+C
# - Colored output with progress indicators
#
# Usage: ./start.sh [options]
# Options:
#   --no-db          Skip database setup (use existing DB)
#   --docker-db      Force using Docker for PostgreSQL
#   --no-seed        Skip database seeding
#   --prod           Production mode (build + start)
#   --help           Show this help
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="${PROJECT_ROOT}/server"
CLIENT_DIR="${PROJECT_ROOT}/client"

# Database
DB_NAME="hackathon_hub"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Ports
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

# Version requirements
REQUIRED_NODE_VERSION="18"
REQUIRED_NPM_VERSION="9"

# Docker PostgreSQL
DOCKER_DB_CONTAINER="hackathon-hub-postgres"
DOCKER_DB_IMAGE="postgres:16-alpine"

# Flags
SKIP_DB=false
FORCE_DOCKER_DB=false
SKIP_SEED=false
PROD_MODE=false

# Process IDs
BACKEND_PID=""
FRONTEND_PID=""
DOCKER_DB_STARTED=false

# -----------------------------------------------------------------------------
# Colors & Helpers
# -----------------------------------------------------------------------------
# Detect if terminal supports colors
if [[ -t 1 ]] && [[ "${TERM:-}" != "dumb" ]] && command -v tput &>/dev/null && [[ $(tput colors 2>/dev/null || echo 0) -ge 8 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    MAGENTA='\033[0;35m'
    BOLD='\033[1m'
    DIM='\033[2m'
    NC='\033[0m' # No Color
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' MAGENTA='' BOLD='' DIM='' NC=''
fi

log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }
log_step()    { echo -e "\n${CYAN}==== $* ====${NC}"; }
log_debug()   { [[ "${DEBUG:-}" == "1" ]] && echo -e "${DIM}[DEBUG]${NC} $*" || true; }

# Spinner for long operations
spinner() {
    local pid=$1
    local msg=$2
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    while kill -0 "$pid" 2>/dev/null; do
        printf "\r${YELLOW}[%c]${NC} %s" "${spin:i++%${#spin}:1}" "$msg"
        sleep 0.1
    done
    wait "$pid" 2>/dev/null
    local exit_code=$?
    if [[ $exit_code -eq 0 ]]; then
        printf "\r${GREEN}[✓]${NC} %s\n" "$msg"
    else
        printf "\r${RED}[✗]${NC} %s (exit code: %d)\n" "$msg" "$exit_code"
    fi
    return $exit_code
}

# Run with spinner
run_with_spinner() {
    local msg=$1
    shift
    ("$@") &
    local pid=$!
    spinner "$pid" "$msg"
}

# -----------------------------------------------------------------------------
# OS Detection
# -----------------------------------------------------------------------------
detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux" ;;
        Darwin*)    echo "macos" ;;
        CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
        *)          echo "unknown" ;;
    esac
}

OS="$(detect_os)"
log_debug "Detected OS: $OS"

# -----------------------------------------------------------------------------
# Cleanup on Exit
# -----------------------------------------------------------------------------
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    # Stop frontend
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "Stopping frontend (PID: $FRONTEND_PID)..."
        kill "$FRONTEND_PID" 2>/dev/null || true
        sleep 0.3
        kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    # Stop backend
    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_info "Stopping backend (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID" 2>/dev/null || true
        sleep 0.3
        kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    
    # Stop Docker database if we started it
    if [[ "$DOCKER_DB_STARTED" == "true" ]]; then
        log_info "Stopping Docker PostgreSQL container..."
        docker stop "$DOCKER_DB_CONTAINER" >/dev/null 2>&1 || true
        docker rm "$DOCKER_DB_CONTAINER" >/dev/null 2>&1 || true
    fi
    
    echo -e "${GREEN}All services stopped.${NC}"
}

trap cleanup EXIT INT TERM

# -----------------------------------------------------------------------------
# Prerequisite Checks
# -----------------------------------------------------------------------------
check_command() {
    local cmd=$1
    local install_hint=${2:-}
    if ! command -v "$cmd" &>/dev/null; then
        log_error "$cmd not found."
        [[ -n "$install_hint" ]] && log_info "Install: $install_hint"
        return 1
    fi
    local version=$($cmd --version 2>/dev/null | head -1 || $cmd -v 2>/dev/null | head -1 || echo "version unknown")
    log_success "$cmd found: $version"
    return 0
}

check_version() {
    local cmd=$1
    local min_version=$2
    local version
    version=$($cmd --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    if [[ -z "$version" ]]; then
        log_warn "Could not determine $cmd version"
        return 0
    fi
    local major
    major=$(echo "$version" | cut -d. -f1)
    if [[ "$major" -lt "$min_version" ]]; then
        log_error "$cmd version $version is too old. Required: >= $min_version"
        return 1
    fi
    log_success "$cmd version $version meets requirement (>= $min_version)"
    return 0
}

# -----------------------------------------------------------------------------
# Environment File Management
# -----------------------------------------------------------------------------
setup_env_files() {
    log_step "Setting up environment files"
    
    # Root .env
    if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
        if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
            log_info "Creating .env from .env.example"
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            log_success "Created $PROJECT_ROOT/.env"
        else
            log_warn "No .env.example found at project root"
        fi
    else
        log_success "Root .env already exists"
    fi
    
    # Server .env
    if [[ ! -f "$SERVER_DIR/.env" ]]; then
        if [[ -f "$SERVER_DIR/.env.example" ]]; then
            log_info "Creating server/.env from server/.env.example"
            cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
            log_success "Created $SERVER_DIR/.env"
        else
            log_warn "No server/.env.example found"
        fi
    else
        log_success "Server .env already exists"
    fi
    
    # Client .env
    if [[ ! -f "$CLIENT_DIR/.env" ]]; then
        if [[ -f "$CLIENT_DIR/.env.example" ]]; then
            log_info "Creating client/.env from client/.env.example"
            cp "$CLIENT_DIR/.env.example" "$CLIENT_DIR/.env"
            log_success "Created $CLIENT_DIR/.env"
        else
            log_warn "No client/.env.example found"
        fi
    else
        log_success "Client .env already exists"
    fi
}

# -----------------------------------------------------------------------------
# Database Functions
# -----------------------------------------------------------------------------
check_docker() {
    if command -v docker &>/dev/null && docker info &>/dev/null; then
        log_success "Docker is available"
        return 0
    fi
    log_warn "Docker not available or not running"
    return 1
}

start_docker_postgres() {
    log_step "Starting PostgreSQL via Docker"
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${DOCKER_DB_CONTAINER}$"; then
        log_info "Container $DOCKER_DB_CONTAINER exists, starting it..."
        docker start "$DOCKER_DB_CONTAINER" >/dev/null
    else
        log_info "Creating new PostgreSQL container..."
        docker run -d \
            --name "$DOCKER_DB_CONTAINER" \
            -e POSTGRES_DB="$DB_NAME" \
            -e POSTGRES_USER="$DB_USER" \
            -e POSTGRES_PASSWORD="$DB_PASSWORD" \
            -p "$DB_PORT:5432" \
            "$DOCKER_DB_IMAGE" >/dev/null
    fi
    
    DOCKER_DB_STARTED=true
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    local attempt=1
    local max_attempts=30
    while [[ $attempt -le $max_attempts ]]; do
        if docker exec "$DOCKER_DB_CONTAINER" pg_isready -U "$DB_USER" -q 2>/dev/null; then
            log_success "PostgreSQL is ready in Docker!"
            return 0
        fi
        printf "\r${YELLOW}[%d/%d]${NC} Waiting for PostgreSQL..." "$attempt" "$max_attempts"
        sleep 1
        ((attempt++))
    done
    
    printf "\r"
    log_error "PostgreSQL in Docker did not become ready in time"
    return 1
}

check_postgres() {
    log_step "Checking PostgreSQL"
    
    # Try local PostgreSQL first
    if command -v pg_isready &>/dev/null; then
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2>/dev/null; then
            log_success "PostgreSQL is running locally at $DB_HOST:$DB_PORT"
            return 0
        fi
    fi
    
    log_warn "Local PostgreSQL not available at $DB_HOST:$DB_PORT"
    
    # Try Docker
    if [[ "$FORCE_DOCKER_DB" == "true" ]] || check_docker; then
        log_info "Attempting to use Docker for PostgreSQL..."
        if start_docker_postgres; then
            # Update connection parameters for Docker
            DB_HOST="localhost"
            export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
            log_success "Using Docker PostgreSQL at $DB_HOST:$DB_PORT"
            return 0
        fi
    fi
    
    log_error "PostgreSQL is not available."
    log_info "Options to fix this:"
    log_info "  1. Start local PostgreSQL:"
    case "$OS" in
        linux)
            log_info "     sudo systemctl start postgresql"
            ;;
        macos)
            log_info "     brew services start postgresql@16"
            ;;
        windows)
            log_info "     Start PostgreSQL service from Services.msc"
            ;;
    esac
    log_info "  2. Use Docker: ./start.sh --docker-db"
    log_info "  3. Skip database setup: ./start.sh --no-db (requires external DB)"
    return 1
}

create_database() {
    log_step "Ensuring database exists: $DB_NAME"
    
    # Use psql to check/create database
    local psql_cmd="psql -h $DB_HOST -p $DB_PORT -U $DB_USER"
    if [[ -n "${DB_PASSWORD:-}" ]]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    if $psql_cmd -lqt 2>/dev/null | cut -d'|' -f1 | grep -qw "$DB_NAME"; then
        log_success "Database '$DB_NAME' already exists"
    else
        log_info "Creating database '$DB_NAME'..."
        if createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null; then
            log_success "Database '$DB_NAME' created"
        else
            log_error "Failed to create database. You may need to create it manually:"
            log_info "  createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME"
            return 1
        fi
    fi
}

run_migrations() {
    log_step "Running database migrations"
    
    cd "$SERVER_DIR"
    
    if [[ ! -f "package.json" ]]; then
        log_error "Server package.json not found"
        return 1
    fi
    
    # Ensure dependencies are installed first
    if [[ ! -d "node_modules" ]]; then
        log_info "Server dependencies not installed, installing first..."
        install_deps "$SERVER_DIR" "backend" || return 1
    fi
    
    # Run migrations
    if npm run migrate 2>&1; then
        log_success "Migrations completed"
    else
        log_error "Migrations failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
}

run_seeds() {
    if [[ "$SKIP_SEED" == "true" ]]; then
        log_warn "Skipping database seeding (--no-seed flag)"
        return 0
    fi
    
    log_step "Seeding database"
    
    cd "$SERVER_DIR"
    
    if npm run seed 2>&1; then
        log_success "Database seeded successfully"
    else
        log_warn "Seeding failed (may be expected if data already exists)"
    fi
    
    cd "$PROJECT_ROOT"
}

# -----------------------------------------------------------------------------
# Dependency Installation
# -----------------------------------------------------------------------------
detect_package_manager() {
    local dir=$1
    if [[ -f "$dir/pnpm-lock.yaml" ]] && command -v pnpm &>/dev/null; then
        echo "pnpm"
    elif [[ -f "$dir/yarn.lock" ]] && command -v yarn &>/dev/null; then
        echo "yarn"
    elif [[ -f "$dir/package-lock.json" ]]; then
        echo "npm"
    else
        echo "npm"
    fi
}

install_deps() {
    local dir=$1
    local name=$2
    
    log_step "Installing $name dependencies"
    
    cd "$dir"
    
    if [[ ! -f "package.json" ]]; then
        log_error "$name package.json not found in $dir"
        return 1
    fi
    
    # Check if node_modules exists and lock file hasn't changed (faster than full install)
    local lock_file=""
    if [[ -f "pnpm-lock.yaml" ]]; then
        lock_file="pnpm-lock.yaml"
    elif [[ -f "yarn.lock" ]]; then
        lock_file="yarn.lock"
    elif [[ -f "package-lock.json" ]]; then
        lock_file="package-lock.json"
    fi
    
    if [[ -d "node_modules" ]] && [[ -n "$lock_file" ]] && [[ "$lock_file" -ot "node_modules" ]]; then
        log_success "$name dependencies already installed (lock file unchanged)"
        cd "$PROJECT_ROOT"
        return 0
    fi
    
    local pm
    pm=$(detect_package_manager "$dir")
    local pm_args=()
    
    case "$pm" in
        pnpm)
            pm_args=("install" "--frozen-lockfile")
            ;;
        yarn)
            pm_args=("install" "--frozen-lockfile")
            ;;
        npm)
            if [[ -f "package-lock.json" ]]; then
                pm_args=("ci")
            else
                pm_args=("install")
            fi
            ;;
    esac
    
    log_info "Using $pm ${pm_args[*]}"
    
    # Run install with error handling
    local output
    local exit_code=0
    output=$($pm "${pm_args[@]}" 2>&1) || exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "$name dependencies installed"
    else
        # Handle npm EALLOWSCRIPTS error (npm v12+)
        if echo "$output" | grep -q "EALLOWSCRIPTS"; then
            log_warn "npm scripts restriction detected. Retrying with --ignore-scripts..."
            if $pm "${pm_args[@]}" --ignore-scripts 2>&1; then
                log_success "$name dependencies installed (scripts skipped)"
                log_warn "Some packages may need manual rebuild. Run: cd $dir && npm rebuild"
            else
                log_error "$pm install failed even with --ignore-scripts"
                echo "$output"
                return 1
            fi
        else
            log_error "$pm install failed (exit code: $exit_code)"
            echo "$output"
            return 1
        fi
    fi
    
    cd "$PROJECT_ROOT"
}

# -----------------------------------------------------------------------------
# Service Health Checks
# -----------------------------------------------------------------------------
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    log_info "Waiting for $name to be ready at $url..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$url" >/dev/null 2>&1; then
            log_success "$name is ready!"
            return 0
        fi
        printf "\r${YELLOW}[%d/%d]${NC} Waiting for %s..." "$attempt" "$max_attempts" "$name"
        sleep 1
        ((attempt++))
    done
    
    printf "\r"
    log_error "$name did not become ready in time (checked $url)"
    return 1
}

# -----------------------------------------------------------------------------
# Build for Production
# -----------------------------------------------------------------------------
build_production() {
    log_step "Building for production"
    
    # Build backend
    log_info "Building backend..."
    cd "$SERVER_DIR"
    if npm run build 2>&1; then
        log_success "Backend built successfully"
    else
        log_error "Backend build failed"
        return 1
    fi
    cd "$PROJECT_ROOT"
    
    # Build frontend
    log_info "Building frontend..."
    cd "$CLIENT_DIR"
    if npm run build 2>&1; then
        log_success "Frontend built successfully"
    else
        log_error "Frontend build failed"
        return 1
    fi
    cd "$PROJECT_ROOT"
}

# -----------------------------------------------------------------------------
# Start Services
# -----------------------------------------------------------------------------
start_backend() {
    log_step "Starting backend on port $BACKEND_PORT"
    
    cd "$SERVER_DIR"
    
    if [[ "$PROD_MODE" == "true" ]]; then
        NODE_ENV=production PORT=$BACKEND_PORT node dist/index.js >/dev/null 2>&1 &
    else
        NODE_ENV=development PORT=$BACKEND_PORT npm run dev >/dev/null 2>&1 &
    fi
    
    BACKEND_PID=$!
    cd "$PROJECT_ROOT"
    
    # Wait for backend to be ready
    local health_url="http://localhost:$BACKEND_PORT/api/v1/health"
    wait_for_service "$health_url" "Backend API" 30 || return 1
}

start_frontend() {
    log_step "Starting frontend on port $FRONTEND_PORT"
    
    cd "$CLIENT_DIR"
    
    if [[ "$PROD_MODE" == "true" ]]; then
        # In production, serve the built files with preview
        PORT=$FRONTEND_PORT npm run preview >/dev/null 2>&1 &
    else
        PORT=$FRONTEND_PORT npm run dev >/dev/null 2>&1 &
    fi
    
    FRONTEND_PID=$!
    cd "$PROJECT_ROOT"
    
    # Wait for frontend to be ready
    wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend" 30 || return 1
}

# -----------------------------------------------------------------------------
# Help
# -----------------------------------------------------------------------------
show_help() {
    cat << 'EOF'
Hackathon Hub - Universal Start Script

Usage: ./start.sh [options]

Options:
  --no-db           Skip database setup (use existing database)
  --docker-db       Force using Docker for PostgreSQL
  --no-seed         Skip database seeding
  --prod            Production mode (build + start)
  --help            Show this help message

Environment Variables:
  DB_HOST           PostgreSQL host (default: localhost)
  DB_PORT           PostgreSQL port (default: 5432)
  DB_USER           PostgreSQL user (default: postgres)
  DB_PASSWORD       PostgreSQL password (default: postgres)
  BACKEND_PORT      Backend port (default: 5000)
  FRONTEND_PORT     Frontend port (default: 5173)
  DEBUG             Set to 1 for debug output

Examples:
  ./start.sh                    # Normal development start
  ./start.sh --docker-db        # Use Docker for PostgreSQL
  ./start.sh --no-db --no-seed  # Skip DB setup entirely
  ./start.sh --prod             # Production build and start
  DEBUG=1 ./start.sh            # Debug mode

Demo Credentials (after seeding):
  Admin:  admin@hackathon.com / admin123
  User:   user@hackathon.com  / user123

EOF
}

# -----------------------------------------------------------------------------
# Parse Arguments
# -----------------------------------------------------------------------------
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-db)
                SKIP_DB=true
                shift
                ;;
            --docker-db)
                FORCE_DOCKER_DB=true
                shift
                ;;
            --no-seed)
                SKIP_SEED=true
                shift
                ;;
            --prod)
                PROD_MODE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# -----------------------------------------------------------------------------
# Main Start Sequence
# -----------------------------------------------------------------------------
main() {
    parse_args "$@"
    
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║           Hackathon Hub - Starting Up                    ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    if [[ "$PROD_MODE" == "true" ]]; then
        log_info "Running in ${BOLD}PRODUCTION${NC} mode"
    else
        log_info "Running in ${BOLD}DEVELOPMENT${NC} mode"
    fi
    
    # 1. Check prerequisites
    log_step "Checking prerequisites"
    
    check_command node "https://nodejs.org/" || exit 1
    check_version node "$REQUIRED_NODE_VERSION" || exit 1
    
    check_command npm "https://nodejs.org/" || exit 1
    check_version npm "$REQUIRED_NPM_VERSION" || exit 1
    
    # Check for psql (optional if using Docker)
    if ! check_command psql "PostgreSQL client tools" 2>/dev/null; then
        log_warn "psql not found - will use Docker for database if available"
    fi
    
    # 2. Setup environment files
    setup_env_files
    
    # 3. Database setup (unless skipped)
    if [[ "$SKIP_DB" != "true" ]]; then
        check_postgres || exit 1
        create_database || exit 1
        run_migrations || exit 1
        run_seeds
    else
        log_warn "Skipping database setup (--no-db flag)"
    fi
    
    # 4. Install dependencies
    install_deps "$SERVER_DIR" "backend" || exit 1
    install_deps "$CLIENT_DIR" "frontend" || exit 1
    
    # 5. Build if production mode
    if [[ "$PROD_MODE" == "true" ]]; then
        build_production || exit 1
    fi
    
    # 6. Start backend
    start_backend || exit 1
    
    # 7. Start frontend
    start_frontend || exit 1
    
    # 8. Success!
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  All services started successfully! 🎉                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo -e "  ${CYAN}Frontend:${NC}     http://localhost:$FRONTEND_PORT/"
    echo -e "  ${CYAN}Backend API:${NC}  http://localhost:$BACKEND_PORT/api/v1/health"
    echo -e "  ${CYAN}API Docs:${NC}     http://localhost:$BACKEND_PORT/api/v1/"
    echo -e "\n  ${YELLOW}Demo Credentials:${NC}"
    echo -e "    ${BOLD}Admin:${NC}  admin@hackathon.com / admin123"
    echo -e "    ${BOLD}User:${NC}   user@hackathon.com  / user123"
    echo -e "\n  ${YELLOW}Press Ctrl+C to stop all services${NC}\n"
    
    # Wait for background processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Run main
main "$@"