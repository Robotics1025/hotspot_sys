#!/bin/bash

# FastNet Hotspot System - Status and Monitoring Script
# This script provides comprehensive status monitoring and management

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Icons
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
DATABASE="🗄️"
NETWORK="🌐"
SHIELD="🛡️"

# Helper functions
section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

status() {
    local service=$1
    local status=$2
    local details=$3
    
    if [ "$status" = "ok" ]; then
        echo -e "${CHECK} ${GREEN}$service${NC} $details"
    elif [ "$status" = "warning" ]; then
        echo -e "${WARNING} ${YELLOW}$service${NC} $details"
    else
        echo -e "${CROSS} ${RED}$service${NC} $details"
    fi
}

# Check if service is running
check_service() {
    if systemctl is-active --quiet $1; then
        return 0
    else
        return 1
    fi
}

# Check if port is listening
check_port() {
    if ss -tuln | grep -q ":$1 "; then
        return 0
    else
        return 1
    fi
}

# Get service uptime
get_uptime() {
    local service=$1
    systemctl show "$service" --property=ActiveEnterTimestamp --value 2>/dev/null | while read timestamp; do
        if [ -n "$timestamp" ] && [ "$timestamp" != "n/a" ]; then
            local start_time=$(date -d "$timestamp" +%s 2>/dev/null || echo "0")
            local current_time=$(date +%s)
            local uptime_seconds=$((current_time - start_time))
            
            if [ $uptime_seconds -gt 86400 ]; then
                echo "$((uptime_seconds / 86400))d $((uptime_seconds % 86400 / 3600))h"
            elif [ $uptime_seconds -gt 3600 ]; then
                echo "$((uptime_seconds / 3600))h $((uptime_seconds % 3600 / 60))m"
            else
                echo "$((uptime_seconds / 60))m"
            fi
        else
            echo "unknown"
        fi
    done
}

# System overview
show_system_overview() {
    section "${INFO} System Overview"
    
    echo -e "${CYAN}Server Information:${NC}"
    echo -e "  Hostname: $(hostname)"
    echo -e "  OS: $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    echo -e "  Kernel: $(uname -r)"
    echo -e "  Uptime: $(uptime -p)"
    echo -e "  Load: $(uptime | awk -F'load average:' '{print $2}')"
    
    # Server IP
    local server_ip=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null || hostname -I | awk '{print $1}')
    echo -e "  Public IP: ${server_ip:-"unknown"}"
}

# Service status
show_service_status() {
    section "${ROCKET} Service Status"
    
    # FastNet Application (PM2)
    if command -v pm2 > /dev/null 2>&1; then
        local pm2_status=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="fastnet-hotspot") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$pm2_status" = "online" ]; then
            local uptime=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="fastnet-hotspot") | .pm2_env.pm_uptime' 2>/dev/null || echo "0")
            local uptime_readable="unknown"
            if [ "$uptime" != "0" ] && [ -n "$uptime" ]; then
                local current_time=$(date +%s)
                local uptime_seconds=$(((current_time * 1000 - uptime) / 1000))
                if [ $uptime_seconds -gt 86400 ]; then
                    uptime_readable="$((uptime_seconds / 86400))d $((uptime_seconds % 86400 / 3600))h"
                elif [ $uptime_seconds -gt 3600 ]; then
                    uptime_readable="$((uptime_seconds / 3600))h $((uptime_seconds % 3600 / 60))m"
                else
                    uptime_readable="$((uptime_seconds / 60))m"
                fi
            fi
            status "FastNet Application" "ok" "(uptime: $uptime_readable)"
        else
            status "FastNet Application" "error" "(PM2 status: $pm2_status)"
        fi
    else
        status "FastNet Application" "error" "(PM2 not installed)"
    fi
    
    # Nginx
    if check_service nginx; then
        status "Nginx Web Server" "ok" "(uptime: $(get_uptime nginx))"
    else
        status "Nginx Web Server" "error" "(not running)"
    fi
    
    # FreeRADIUS
    if check_service freeradius; then
        status "FreeRADIUS Server" "ok" "(uptime: $(get_uptime freeradius))"
    else
        status "FreeRADIUS Server" "error" "(not running)"
    fi
    
    # UFW Firewall
    if command -v ufw > /dev/null 2>&1; then
        local ufw_status=$(ufw status | head -1 | awk '{print $2}')
        if [ "$ufw_status" = "active" ]; then
            status "UFW Firewall" "ok" "(active)"
        else
            status "UFW Firewall" "warning" "(inactive)"
        fi
    else
        status "UFW Firewall" "warning" "(not installed)"
    fi
}

# Network status
show_network_status() {
    section "${NETWORK} Network Status"
    
    # Port checks
    if check_port 80; then
        status "HTTP (Port 80)" "ok" "(listening)"
    else
        status "HTTP (Port 80)" "error" "(not listening)"
    fi
    
    if check_port 443; then
        status "HTTPS (Port 443)" "ok" "(listening)"
    else
        status "HTTPS (Port 443)" "warning" "(not configured)"
    fi
    
    if check_port 3000; then
        status "FastNet App (Port 3000)" "ok" "(listening)"
    else
        status "FastNet App (Port 3000)" "error" "(not listening)"
    fi
    
    if check_port 1812; then
        status "RADIUS Auth (Port 1812)" "ok" "(listening)"
    else
        status "RADIUS Auth (Port 1812)" "error" "(not listening)"
    fi
    
    if check_port 1813; then
        status "RADIUS Acct (Port 1813)" "ok" "(listening)"
    else
        status "RADIUS Acct (Port 1813)" "error" "(not listening)"
    fi
    
    # Test external connectivity
    if ping -c 1 google.com > /dev/null 2>&1; then
        status "Internet Connectivity" "ok" "(reachable)"
    else
        status "Internet Connectivity" "warning" "(check network)"
    fi
}

# Database status
show_database_status() {
    section "${DATABASE} Database Status"
    
    if [ -f "/opt/fastnet-hotspot/.env" ]; then
        cd /opt/fastnet-hotspot
        source .env
        
        # Test database connection
        if node -e "
            const postgres = require('postgres');
            const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
            client\`SELECT 1\`.then(() => { console.log('ok'); process.exit(0); }).catch(() => { console.log('error'); process.exit(1); });
        " > /dev/null 2>&1; then
            status "Database Connection" "ok" "(connected)"
            
            # Get database stats if possible
            local db_stats=$(node -e "
                const postgres = require('postgres');
                const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
                client\`SELECT 
                    pg_database_size(current_database()) as size,
                    (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as tables
                \`.then(result => {
                    const size = Math.round(result[0].size / 1024 / 1024 * 100) / 100;
                    console.log(result[0].tables + ' tables, ' + size + 'MB');
                    process.exit(0);
                }).catch(() => { console.log('stats unavailable'); process.exit(0); });
            " 2>/dev/null)
            status "Database Info" "ok" "($db_stats)"
        else
            status "Database Connection" "error" "(connection failed)"
        fi
    else
        status "Database Configuration" "error" "(.env file not found)"
    fi
}

# Resource usage
show_resource_usage() {
    section "${SHIELD} Resource Usage"
    
    # Memory usage
    local mem_info=$(free -m | grep '^Mem:')
    local mem_total=$(echo $mem_info | awk '{print $2}')
    local mem_used=$(echo $mem_info | awk '{print $3}')
    local mem_percent=$((mem_used * 100 / mem_total))
    
    if [ $mem_percent -lt 80 ]; then
        status "Memory Usage" "ok" "(${mem_used}MB / ${mem_total}MB - ${mem_percent}%)"
    elif [ $mem_percent -lt 90 ]; then
        status "Memory Usage" "warning" "(${mem_used}MB / ${mem_total}MB - ${mem_percent}%)"
    else
        status "Memory Usage" "error" "(${mem_used}MB / ${mem_total}MB - ${mem_percent}%)"
    fi
    
    # Disk usage
    local disk_info=$(df /opt | tail -1)
    local disk_percent=$(echo $disk_info | awk '{print $5}' | sed 's/%//')
    local disk_used=$(echo $disk_info | awk '{print $3}')
    local disk_total=$(echo $disk_info | awk '{print $2}')
    
    if [ $disk_percent -lt 80 ]; then
        status "Disk Usage" "ok" "(${disk_used} / ${disk_total} - ${disk_percent}%)"
    elif [ $disk_percent -lt 90 ]; then
        status "Disk Usage" "warning" "(${disk_used} / ${disk_total} - ${disk_percent}%)"
    else
        status "Disk Usage" "error" "(${disk_used} / ${disk_total} - ${disk_percent}%)"
    fi
    
    # Load average
    local load_1min=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | xargs)
    local cpu_count=$(nproc)
    local load_percent=$(echo "$load_1min * 100 / $cpu_count" | bc -l 2>/dev/null | cut -d. -f1 2>/dev/null || echo "0")
    
    if [ -z "$load_percent" ] || [ "$load_percent" -lt 70 ]; then
        status "CPU Load" "ok" "($load_1min avg, ${cpu_count} cores)"
    elif [ "$load_percent" -lt 90 ]; then
        status "CPU Load" "warning" "($load_1min avg, ${cpu_count} cores)"
    else
        status "CPU Load" "error" "($load_1min avg, ${cpu_count} cores)"
    fi
}

# Recent logs
show_recent_logs() {
    section "${INFO} Recent Activity"
    
    echo -e "${CYAN}FastNet Application Logs (last 10 lines):${NC}"
    if [ -f "/opt/fastnet-hotspot/logs/combined.log" ]; then
        tail -10 /opt/fastnet-hotspot/logs/combined.log 2>/dev/null || echo "  No logs available"
    else
        echo "  Log file not found"
    fi
    
    echo -e "\n${CYAN}RADIUS Server Logs (last 5 lines):${NC}"
    if [ -f "/var/log/freeradius/radius.log" ]; then
        tail -5 /var/log/freeradius/radius.log 2>/dev/null || echo "  No logs available"
    else
        echo "  Log file not found"
    fi
    
    echo -e "\n${CYAN}Nginx Error Logs (last 3 lines):${NC}"
    if [ -f "/var/log/nginx/error.log" ]; then
        tail -3 /var/log/nginx/error.log 2>/dev/null || echo "  No errors"
    else
        echo "  Log file not found"
    fi
}

# Quick actions
show_quick_actions() {
    section "${ROCKET} Quick Actions"
    
    echo -e "${CYAN}Common Management Commands:${NC}"
    echo -e "  ${GREEN}pm2 restart fastnet-hotspot${NC}   - Restart application"
    echo -e "  ${GREEN}pm2 logs fastnet-hotspot${NC}      - View detailed logs"
    echo -e "  ${GREEN}systemctl restart nginx${NC}       - Restart web server"
    echo -e "  ${GREEN}systemctl restart freeradius${NC}  - Restart RADIUS server"
    echo -e "  ${GREEN}/opt/scripts/update-fastnet.sh${NC} - Update application"
    echo -e "  ${GREEN}/opt/scripts/backup-fastnet.sh${NC} - Create backup"
    
    echo -e "\n${CYAN}Access URLs:${NC}"
    local server_ip=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null || hostname -I | awk '{print $1}')
    echo -e "  ${BLUE}Admin Panel:${NC} http://$server_ip/admin"
    echo -e "  ${BLUE}Client Portal:${NC} http://$server_ip/client"
    echo -e "  ${BLUE}Captive Portal:${NC} http://$server_ip/login"
}

# Test RADIUS functionality
test_radius() {
    section "${NETWORK} RADIUS Functionality Test"
    
    # Test RADIUS authentication with test users
    local test_users=("testuser1:password123" "demo:demopass")
    
    for user_pass in "${test_users[@]}"; do
        local username=$(echo $user_pass | cut -d':' -f1)
        local password=$(echo $user_pass | cut -d':' -f2)
        
        if radtest $username $password localhost 0 testing123 > /dev/null 2>&1; then
            status "RADIUS Auth ($username)" "ok" "(authentication successful)"
        else
            status "RADIUS Auth ($username)" "error" "(authentication failed)"
        fi
    done
}

# Performance metrics
show_performance() {
    section "${SHIELD} Performance Metrics"
    
    # Application response time
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/health 2>/dev/null || echo "timeout")
    if [ "$response_time" != "timeout" ]; then
        local response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
        if [ "$response_ms" -lt 500 ]; then
            status "App Response Time" "ok" "(${response_ms}ms)"
        elif [ "$response_ms" -lt 2000 ]; then
            status "App Response Time" "warning" "(${response_ms}ms)"
        else
            status "App Response Time" "error" "(${response_ms}ms)"
        fi
    else
        status "App Response Time" "error" "(timeout)"
    fi
    
    # Process memory usage
    if command -v pm2 > /dev/null 2>&1; then
        local mem_usage=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="fastnet-hotspot") | .monit.memory' 2>/dev/null || echo "0")
        if [ "$mem_usage" != "0" ] && [ -n "$mem_usage" ]; then
            local mem_mb=$((mem_usage / 1024 / 1024))
            if [ $mem_mb -lt 500 ]; then
                status "App Memory Usage" "ok" "(${mem_mb}MB)"
            elif [ $mem_mb -lt 1000 ]; then
                status "App Memory Usage" "warning" "(${mem_mb}MB)"
            else
                status "App Memory Usage" "error" "(${mem_mb}MB)"
            fi
        else
            status "App Memory Usage" "error" "(not available)"
        fi
    fi
}

# Health check summary
show_health_summary() {
    section "${CHECK} Health Summary"
    
    local issues=0
    local warnings=0
    
    # Count issues (this is a simplified check)
    if ! check_service nginx; then ((issues++)); fi
    if ! check_service freeradius; then ((issues++)); fi
    if ! check_port 3000; then ((issues++)); fi
    if ! check_port 1812; then ((issues++)); fi
    
    # Memory check
    local mem_percent=$(free | grep '^Mem:' | awk '{print ($3/$2) * 100.0}' | cut -d. -f1)
    if [ "$mem_percent" -gt 90 ]; then ((issues++)); fi
    if [ "$mem_percent" -gt 80 ]; then ((warnings++)); fi
    
    # Disk check
    local disk_percent=$(df /opt | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_percent" -gt 90 ]; then ((issues++)); fi
    if [ "$disk_percent" -gt 80 ]; then ((warnings++)); fi
    
    echo -e "${CYAN}Overall System Health:${NC}"
    if [ $issues -eq 0 ] && [ $warnings -eq 0 ]; then
        echo -e "  ${CHECK} ${GREEN}Excellent${NC} - All systems operational"
    elif [ $issues -eq 0 ]; then
        echo -e "  ${WARNING} ${YELLOW}Good${NC} - $warnings warning(s) detected"
    else
        echo -e "  ${CROSS} ${RED}Issues Detected${NC} - $issues critical issue(s), $warnings warning(s)"
        echo -e "  ${INFO} Run individual service checks for details"
    fi
}

# Main function
main() {
    local action=${1:-"status"}
    
    case $action in
        "status"|"")
            echo -e "${PURPLE}FastNet Hotspot System Status${NC}"
            echo -e "${BLUE}Generated: $(date)${NC}"
            
            show_system_overview
            show_service_status
            show_network_status
            show_resource_usage
            show_health_summary
            show_quick_actions
            ;;
        "full"|"detailed")
            echo -e "${PURPLE}FastNet Hotspot System - Detailed Status${NC}"
            echo -e "${BLUE}Generated: $(date)${NC}"
            
            show_system_overview
            show_service_status
            show_network_status
            show_database_status
            show_resource_usage
            show_performance
            test_radius
            show_recent_logs
            show_health_summary
            show_quick_actions
            ;;
        "services")
            show_service_status
            ;;
        "network")
            show_network_status
            ;;
        "database")
            show_database_status
            ;;
        "resources")
            show_resource_usage
            ;;
        "logs")
            show_recent_logs
            ;;
        "test")
            test_radius
            ;;
        "help")
            echo -e "${PURPLE}FastNet Status Script Usage:${NC}"
            echo -e "  ${GREEN}$0${NC} [status|full|services|network|database|resources|logs|test|help]"
            echo
            echo -e "${CYAN}Commands:${NC}"
            echo -e "  status     - Basic system status (default)"
            echo -e "  full       - Comprehensive status report"
            echo -e "  services   - Service status only"
            echo -e "  network    - Network connectivity checks"
            echo -e "  database   - Database connection tests"
            echo -e "  resources  - System resource usage"
            echo -e "  logs       - Recent log entries"
            echo -e "  test       - Test RADIUS functionality"
            echo -e "  help       - Show this help message"
            ;;
        *)
            echo -e "${RED}Unknown command: $action${NC}"
            echo -e "Use ${GREEN}$0 help${NC} for available commands"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"