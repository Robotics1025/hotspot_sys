#!/bin/bash

# FastNet Hotspot System - One-Click Deployment Script
# This script automates the entire deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root. Please use 'sudo ./deploy.sh'"
    fi
}

# Get server IP
get_server_ip() {
    SERVER_IP=$(curl -s http://checkip.amazonaws.com/ || curl -s http://ipinfo.io/ip || hostname -I | awk '{print $1}')
    if [ -z "$SERVER_IP" ]; then
        error "Could not determine server IP address"
    fi
    log "Server IP detected: $SERVER_IP"
}

# Update system
update_system() {
    log "Updating system packages..."
    apt update && apt upgrade -y
    log "System updated successfully"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log "Node.js installed: $NODE_VERSION"
    log "NPM installed: $NPM_VERSION"
}

# Install PM2
install_pm2() {
    log "Installing PM2 process manager..."
    npm install -g pm2
    log "PM2 installed successfully"
}

# Install other dependencies
install_dependencies() {
    log "Installing additional dependencies..."
    apt install -y git nginx ufw htop curl wget unzip
    log "Dependencies installed successfully"
}

# Setup RADIUS server
setup_radius() {
    log "Setting up FreeRADIUS server..."
    
    # Check if setup script exists
    if [ ! -f "scripts/setup-radius.sh" ]; then
        error "RADIUS setup script not found. Please ensure scripts/setup-radius.sh exists."
    fi
    
    chmod +x scripts/setup-radius.sh
    ./scripts/setup-radius.sh
    
    log "FreeRADIUS setup completed"
}

# Clone or update application
setup_application() {
    log "Setting up FastNet application..."
    
    APP_DIR="/opt/fastnet-hotspot"
    
    # If directory exists, update it
    if [ -d "$APP_DIR" ]; then
        log "Updating existing application..."
        cd "$APP_DIR"
        git pull
    else
        log "Cloning application repository..."
        cd /opt
        # You'll need to replace this with your actual repository URL
        git clone https://github.com/your-username/fastnet-hotspot.git
        cd fastnet-hotspot
    fi
    
    log "Installing Node.js dependencies..."
    npm install
    
    log "Application setup completed"
}

# Configure environment
configure_environment() {
    log "Configuring environment variables..."
    
    cd /opt/fastnet-hotspot
    
    # Create .env from template if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        
        # Update environment with server IP
        sed -i "s/YOUR_DROPLET_IP/$SERVER_IP/g" .env
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -hex 32)
        NEXTAUTH_SECRET=$(openssl rand -hex 32)
        
        sed -i "s/your-production-jwt-secret-32-chars-minimum/$JWT_SECRET/" .env
        sed -i "s/your-nextauth-secret-32-chars-minimum/$NEXTAUTH_SECRET/" .env
        
        log "Environment configured with server IP: $SERVER_IP"
    else
        warn "Environment file already exists, skipping configuration"
    fi
}

# Setup database
setup_database() {
    log "Initializing database schema..."
    
    cd /opt/fastnet-hotspot
    
    # Check if we can connect to the database
    npm run db:push || warn "Database migration failed - please check database connection"
    
    log "Database initialization completed"
}

# Build application
build_application() {
    log "Building production application..."
    
    cd /opt/fastnet-hotspot
    npm run build
    
    log "Application built successfully"
}

# Setup PM2
setup_pm2() {
    log "Configuring PM2 process manager..."
    
    cd /opt/fastnet-hotspot
    
    # Create logs directory
    mkdir -p logs
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'fastnet-hotspot',
    script: 'npm',
    args: 'start',
    cwd: '/opt/fastnet-hotspot',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

    # Start the application
    pm2 start ecosystem.config.js
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    log "PM2 configured and application started"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx reverse proxy..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/fastnet << EOF
server {
    listen 80;
    server_name $SERVER_IP _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Remove default site and enable our site
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/fastnet /etc/nginx/sites-enabled/
    
    # Test and restart Nginx
    nginx -t || error "Nginx configuration test failed"
    systemctl restart nginx
    systemctl enable nginx
    
    log "Nginx configured successfully"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (be careful not to lock yourself out)
    ufw allow ssh
    
    # Allow HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow RADIUS
    ufw allow 1812/udp
    ufw allow 1813/udp
    
    # Allow application port (just in case)
    ufw allow 3000/tcp
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured successfully"
}

# Create maintenance scripts
create_maintenance_scripts() {
    log "Creating maintenance scripts..."
    
    mkdir -p /opt/scripts
    
    # Update script
    cat > /opt/scripts/update-fastnet.sh << 'EOF'
#!/bin/bash
set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting FastNet update..."

cd /opt/fastnet-hotspot
git pull
npm install
npm run build
pm2 restart fastnet-hotspot

log "FastNet updated successfully"
EOF

    # Backup script
    cat > /opt/scripts/backup-fastnet.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting backup..."

# Backup application
tar -czf "$BACKUP_DIR/fastnet-app-$DATE.tar.gz" -C /opt fastnet-hotspot

# Backup database (you may need to adjust this based on your setup)
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/fastnet-db-$DATE.sql" 2>/dev/null || echo "Database backup failed - check DATABASE_URL"

# Keep only last 7 backups
find $BACKUP_DIR -name "fastnet-*" -type f -mtime +7 -delete

log "Backup completed: fastnet-app-$DATE.tar.gz"
EOF

    # Make scripts executable
    chmod +x /opt/scripts/*.sh
    
    log "Maintenance scripts created in /opt/scripts/"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up basic monitoring..."
    
    # Create a simple monitoring script
    cat > /opt/scripts/monitor-fastnet.sh << 'EOF'
#!/bin/bash

check_service() {
    if systemctl is-active --quiet $1; then
        echo "✅ $1 is running"
        return 0
    else
        echo "❌ $1 is not running"
        return 1
    fi
}

check_port() {
    if nc -z localhost $1; then
        echo "✅ Port $1 is open"
        return 0
    else
        echo "❌ Port $1 is not accessible"
        return 1
    fi
}

echo "=== FastNet System Health Check ==="
echo "Date: $(date)"
echo

# Check services
check_service nginx
check_service freeradius

# Check PM2 processes
if pm2 jlist | grep -q "fastnet-hotspot"; then
    echo "✅ FastNet application is running"
else
    echo "❌ FastNet application is not running"
fi

# Check ports
check_port 80
check_port 3000
check_port 1812

# Check disk space
echo
echo "=== Disk Usage ==="
df -h /

# Check memory usage
echo
echo "=== Memory Usage ==="
free -h

# Check load average
echo
echo "=== Load Average ==="
uptime
EOF

    chmod +x /opt/scripts/monitor-fastnet.sh
    
    # Setup cron job for monitoring (optional)
    # (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/scripts/monitor-fastnet.sh >> /var/log/fastnet-monitor.log 2>&1") | crontab -
    
    log "Monitoring setup completed"
}

# Main deployment function
main() {
    log "Starting FastNet Hotspot System deployment..."
    log "This may take several minutes. Please be patient."
    
    check_root
    get_server_ip
    update_system
    install_nodejs
    install_pm2
    install_dependencies
    setup_radius
    setup_application
    configure_environment
    setup_database
    build_application
    setup_pm2
    configure_nginx
    configure_firewall
    create_maintenance_scripts
    setup_monitoring
    
    echo
    echo "🎉 FastNet Hotspot System deployment completed successfully!"
    echo
    echo "📊 Access your system:"
    echo "   • Web Interface: http://$SERVER_IP"
    echo "   • Admin Panel: http://$SERVER_IP/admin"
    echo "   • Client Portal: http://$SERVER_IP/client"
    echo
    echo "🔧 Useful commands:"
    echo "   • Check status: pm2 status"
    echo "   • View logs: pm2 logs fastnet-hotspot"
    echo "   • System health: /opt/scripts/monitor-fastnet.sh"
    echo "   • Update app: /opt/scripts/update-fastnet.sh"
    echo
    echo "📁 Important files:"
    echo "   • Application: /opt/fastnet-hotspot"
    echo "   • Environment: /opt/fastnet-hotspot/.env"
    echo "   • Scripts: /opt/scripts/"
    echo "   • Logs: /opt/fastnet-hotspot/logs/"
    echo
    echo "⚠️  Next steps:"
    echo "   1. Update DNS records to point to $SERVER_IP"
    echo "   2. Configure SSL/TLS certificates"
    echo "   3. Setup regular backups"
    echo "   4. Configure MikroTik routers to use RADIUS: $SERVER_IP:1812"
    echo
}

# Run main function
main "$@"