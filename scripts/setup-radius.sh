#!/bin/bash

# FastNet RADIUS Server Setup Script
# For Ubuntu 22.04 LTS on DigitalOcean Droplet
# Run this script as root: sudo bash setup-radius.sh

set -e

echo "🚀 FastNet RADIUS Server Setup Starting..."
echo "================================================"

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install FreeRADIUS and PostgreSQL client
echo "📡 Installing FreeRADIUS server..."
apt install -y freeradius freeradius-postgresql freeradius-utils postgresql-client

# Stop FreeRADIUS service for configuration  
echo "⏹️  Stopping FreeRADIUS service..."
systemctl stop freeradius

# Backup original configuration
echo "💾 Backing up original FreeRADIUS configuration..."
cp -r /etc/freeradius/3.0 /etc/freeradius/3.0.backup

# Configure PostgreSQL connection
echo "🗄️  Configuring PostgreSQL connection..."

# Create SQL module configuration
cat > /etc/freeradius/3.0/mods-available/sql << 'EOF'
sql {
    driver = "rlm_sql_postgresql"
    dialect = "postgresql"
    
    # Database connection info
    server = "db-postgresql-blr1-23483-do-user-33601364-0.d.db.ondigitalocean.com"
    port = 25060
    login = "doadmin"
    DB_PASS="<YOUR_DATABASE_PASSWORD>"
    radius_db = "defaultdb"
    
    # SSL Configuration for DigitalOcean
    tls {
        tls_required = yes
        tls_check_cert = no
    }
    
    # Connection pool settings
    pool {
        start = 5
        min = 4
        max = 32
        spare = 3
        uses = 0
        retry_delay = 30
        lifetime = 0
        idle_timeout = 60
    }
    
    # Safe characters for SQL queries
    safe_characters = "@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_: /"
    
    # Query configuration
    read_groups = yes
    read_profiles = yes
    
    # Database queries (using FastNet schema)
    authorize_check_query = "\
        SELECT id, username, attribute, value, op \
        FROM radcheck \
        WHERE username = '%{SQL-User-Name}' \
        ORDER BY id"
    
    authorize_reply_query = "\
        SELECT id, username, attribute, value, op \
        FROM radreply \
        WHERE username = '%{SQL-User-Name}' \
        ORDER BY id"
    
    accounting_start_query = "\
        INSERT INTO radacct \
        (acctsessionid, acctuniqueid, username, realm, nasipaddress, \
         nasportid, nasporttype, acctstarttime, acctupdatetime, \
         acctsessiontime, acctauthentic, connectinfo_start, \
         calledstationid, callingstationid, servicetype, framedprotocol, \
         framedipaddress) \
        VALUES \
        ('%{Acct-Session-Id}', '%{Acct-Unique-Session-Id}', \
         '%{SQL-User-Name}', '%{Realm}', '%{NAS-IP-Address}', \
         '%{NAS-Port}', '%{NAS-Port-Type}', \
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, \
         '0', '%{Acct-Authentic}', '%{Connect-Info}', \
         '%{Called-Station-Id}', '%{Calling-Station-Id}', \
         '%{Service-Type}', '%{Framed-Protocol}', \
         NULLIF('%{Framed-IP-Address}', '')::inet)"
    
    accounting_update_query = "\
        UPDATE radacct \
        SET acctupdatetime = CURRENT_TIMESTAMP, \
            acctsessiontime = '%{Acct-Session-Time}', \
            acctinputoctets = '%{Acct-Input-Octets}', \
            acctoutputoctets = '%{Acct-Output-Octets}' \
        WHERE acctsessionid = '%{Acct-Session-Id}' \
        AND username = '%{SQL-User-Name}' \
        AND nasipaddress = '%{NAS-IP-Address}'"
    
    accounting_stop_query = "\
        UPDATE radacct SET \
            acctstoptime = CURRENT_TIMESTAMP, \
            acctsessiontime = '%{Acct-Session-Time}', \
            acctinputoctets = '%{Acct-Input-Octets}', \
            acctoutputoctets = '%{Acct-Output-Octets}', \
            acctterminatecause = '%{Acct-Terminate-Cause}', \
            connectinfo_stop = '%{Connect-Info}' \
        WHERE acctsessionid = '%{Acct-Session-Id}' \
        AND username = '%{SQL-User-Name}' \
        AND nasipaddress = '%{NAS-IP-Address}'"
    
    accounting_on_query = "\
        UPDATE radacct \
        SET acctstoptime = CURRENT_TIMESTAMP, \
            acctterminatecause = '%{Acct-Terminate-Cause}' \
        WHERE acctstoptime IS NULL \
        AND nasipaddress = '%{NAS-IP-Address}' \
        AND acctstarttime <= CURRENT_TIMESTAMP"
    
    accounting_off_query = "${accounting_on_query}"
}
EOF

# Enable SQL module
echo "🔗 Enabling SQL module..."
ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql

# Configure clients (NAS devices)
echo "🔧 Configuring RADIUS clients..."
cat > /etc/freeradius/3.0/clients.conf << 'EOF'
# FastNet RADIUS Clients Configuration

# Allow connections from any MikroTik router (for development)
# In production, specify exact IP ranges for security
client mikrotik_default {
    ipaddr = 0.0.0.0/0
    secret = FastNet-Radius-2026
    require_message_authenticator = no
    nas_type = mikrotik
}

# Localhost for testing
client localhost {
    ipaddr = 127.0.0.1
    secret = testing123
    require_message_authenticator = no
}

# Example specific client configuration
# client mikrotik_router_1 {
#     ipaddr = 192.168.1.1
#     secret = FastNet-Radius-2026
#     shortname = mt-router-1
#     nas_type = mikrotik
# }
EOF

# Configure authorization
echo "📋 Configuring authorization..."
sed -i 's/^#.*sql$/sql/' /etc/freeradius/3.0/sites-enabled/default
sed -i 's/^#.*sql$/sql/' /etc/freeradius/3.0/sites-enabled/inner-tunnel

# Configure accounting  
sed -i '/accounting {/,/}/ s/^#.*sql$/sql/' /etc/freeradius/3.0/sites-enabled/default

# Set correct permissions
echo "🔐 Setting permissions..."
chown -R freerad:freerad /etc/freeradius/3.0/
chmod 640 /etc/freeradius/3.0/mods-available/sql

# Configure firewall (if ufw is enabled)
echo "🛡️  Configuring firewall rules..."
if systemctl is-active --quiet ufw; then
    ufw allow 1812/udp comment "RADIUS Authentication"
    ufw allow 1813/udp comment "RADIUS Accounting"
    echo "✅ UFW firewall rules added"
else
    echo "ℹ️  UFW not active, make sure ports 1812 and 1813 are open"
fi

# Start and enable FreeRADIUS
echo "▶️  Starting FreeRADIUS service..."
systemctl enable freeradius
systemctl start freeradius

# Test configuration
echo "🧪 Testing RADIUS configuration..."
if freeradius -X -f &
then
    sleep 5
    pkill -f "freeradius -X"
    echo "✅ FreeRADIUS configuration test passed!"
else
    echo "❌ FreeRADIUS configuration test failed!"
    exit 1
fi

# Display status
echo ""
echo "🎉 FastNet RADIUS Server Setup Complete!"
echo "================================================"
echo "📋 Configuration Summary:"
echo "  • RADIUS Server IP: $(curl -s ifconfig.me)"
echo "  • Authentication Port: 1812"
echo "  • Accounting Port: 1813"
echo "  • Default Secret: FastNet-Radius-2026"
echo "  • Database: Connected to DigitalOcean PostgreSQL"
echo ""
echo "📁 Important Files:"
echo "  • Main Config: /etc/freeradius/3.0/"
echo "  • Clients: /etc/freeradius/3.0/clients.conf"
echo "  • SQL Module: /etc/freeradius/3.0/mods-enabled/sql"
echo ""
echo "🔧 Service Management:"
echo "  • Status: systemctl status freeradius"
echo "  • Start: systemctl start freeradius"
echo "  • Stop: systemctl stop freeradius"
echo "  • Restart: systemctl restart freeradius"
echo "  • Logs: tail -f /var/log/freeradius/radius.log"
echo ""
echo "🧪 Test Command:"
echo "  radtest testuser testpass localhost 0 testing123"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Update your .env file with this server's IP address"
echo "  2. Configure your MikroTik routers with this RADIUS server"
echo "  3. Test authentication with a sample user"
echo "  4. Monitor logs for any issues"
echo ""