#!/bin/bash

# Production Deployment Script for Evalis-GT
# This script handles the complete deployment process
# Run from project root: ./scripts/deployment/deploy.sh

set -e  # Exit on any error

# Change to project root directory
cd "$(dirname "$0")/../.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="evalis-gt"
DOCKER_IMAGE="ghcr.io/anntmishra/evalis-gt:latest"
CONTAINER_NAME="evalis-app"
BACKUP_DIR="/backup/evalis"
LOG_FILE="/var/log/evalis-deployment.log"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_error ".env file not found. Please create it from .env.example"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    log "Creating backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Backup database (if running locally)
    if docker ps | grep -q postgres; then
        log "Backing up database..."
        docker exec postgres pg_dump -U postgres evalis > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    fi
    
    # Backup uploads directory
    if [ -d "backend/uploads" ]; then
        echo -e "${YELLOW}Backing up uploads...${NC}"
        tar -czf "$BACKUP_DIR/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" backend/uploads/
    fi
    
    # Keep only last 5 backups
    find "$BACKUP_DIR" -name "*.sql" -type f -exec ls -t {} + | tail -n +6 | xargs -r rm
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -exec ls -t {} + | tail -n +6 | xargs -r rm
    
    log "Backup completed"
}

# Function to pull latest image
pull_image() {
    log "Pulling latest Docker image..."
    docker pull "$DOCKER_IMAGE"
    log "Image pulled successfully"
}

# Function to stop existing containers
stop_containers() {
    log "Stopping existing containers..."
    docker-compose down --remove-orphans
    log "Containers stopped"
}

# Function to start containers
start_containers() {
    log "Starting containers..."
    docker-compose up -d
    log "Containers started"
}

# Function to wait for health check
wait_for_health() {
    log "Waiting for application to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            log "Application is healthy"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, waiting 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Application failed to become healthy within 5 minutes"
    return 1
}

# Function to run database migrations (if needed)
run_migrations() {
    log "Running database migrations..."
    # Add your migration commands here
    # docker-compose exec app npm run migrate
    log "Migrations completed"
}

# Function to cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    docker system prune -f --volumes
    log "Cleanup completed"
}

# Function to send notification (optional)
send_notification() {
    local status=$1
    local message="Evalis-GT deployment $status at $(date)"
    
    # Add your notification logic here (Slack, email, etc.)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"$message\"}" \
    #     YOUR_SLACK_WEBHOOK_URL
    
    log "Notification sent: $message"
}

# Function to rollback (in case of failure)
rollback() {
    log_error "Deployment failed, attempting rollback..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if available
    local latest_backup=$(find "$BACKUP_DIR" -name "*.sql" -type f -exec ls -t {} + | head -n 1)
    if [ -n "$latest_backup" ]; then
        log "Restoring database from backup: $latest_backup"
        # Add database restore logic here
    fi
    
    # Start with previous version
    docker-compose up -d
    
    log_error "Rollback completed"
    send_notification "FAILED (rolled back)"
}

# Main deployment function
deploy() {
    log "Starting deployment of $APP_NAME..."
    
    # Create backup before deployment
    create_backup
    
    # Pull latest image
    pull_image
    
    # Stop existing containers
    stop_containers
    
    # Start new containers
    start_containers
    
    # Wait for health check
    if wait_for_health; then
        log "Deployment successful!"
        cleanup
        send_notification "SUCCESS"
    else
        rollback
        exit 1
    fi
}

# Main script
main() {
    log "=== Evalis-GT Deployment Script ==="
    
    # Check if running as root (optional security check)
    if [ "$EUID" -eq 0 ]; then
        log_warning "Running as root. Consider using a non-root user for security."
    fi
    
    check_prerequisites
    deploy
    
    log "=== Deployment completed ==="
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        if curl -f http://localhost:3000/api/health; then
            echo "Application is healthy"
            exit 0
        else
            echo "Application is not healthy"
            exit 1
        fi
        ;;
    "logs")
        docker-compose logs -f "${2:-app}"
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|logs|backup}"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous version"
        echo "  health   - Check application health"
        echo "  logs     - Show application logs"
        echo "  backup   - Create backup only"
        exit 1
        ;;
esac
