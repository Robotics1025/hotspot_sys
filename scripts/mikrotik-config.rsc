# FastNet Hotspot System - MikroTik RouterOS Configuration
# This script contains commands to configure MikroTik routers for FastNet integration

# ============================================================================
# IMPORTANT: Replace the following values with your actual server details:
# - RADIUS_SERVER_IP: Your FastNet server IP address
# - HOTSPOT_INTERFACE: Your hotspot interface (usually wlan1)
# - LAN_INTERFACE: Your LAN interface (usually ether2-master-local)
# - INTERNET_INTERFACE: Your internet interface (usually ether1)
# ============================================================================

# Variables (MODIFY THESE)
:local radiusServer "YOUR_FASTNET_SERVER_IP"
:local radiusSecret "testing123"
:local hotspotInterface "wlan1"
:local lanInterface "ether2-master-local"
:local internetInterface "ether1"
:local hotspotNetwork "10.5.50.0/24"
:local hotspotPool "10.5.50.100-10.5.50.200"

# ============================================================================
# 1. RADIUS CONFIGURATION
# ============================================================================

:put "Configuring RADIUS settings..."

# Add RADIUS server for authentication
/radius add service=hotspot address=$radiusServer secret=$radiusSecret timeout=3s

# Enable RADIUS for accounting (optional)
/radius add service=hotspot address=$radiusServer secret=$radiusSecret timeout=3s accounting-port=1813

:put "RADIUS configuration completed"

# ============================================================================
# 2. HOTSPOT SETUP
# ============================================================================

:put "Setting up Hotspot..."

# Create IP pool for hotspot users
/ip pool add name=hotspot-pool ranges=$hotspotPool

# Create DHCP server for hotspot network
/ip dhcp-server network add address=$hotspotNetwork gateway=10.5.50.1 dns-server=8.8.8.8,8.8.4.4

# Add IP address to hotspot interface
/ip address add address=10.5.50.1/24 interface=$hotspotInterface network=10.5.50.0

# Create hotspot profile
/ip hotspot profile add name=fastnet-profile \
    hotspot-address=10.5.50.1 \
    dns-name=fastnet.local \
    html-directory=hotspot \
    rate-limit=512k/2M \
    http-cookie-lifetime=1d \
    login-by=cookie,http-chap

# Create hotspot server
/ip hotspot add name=fastnet-hotspot \
    interface=$hotspotInterface \
    address-pool=hotspot-pool \
    profile=fastnet-profile

:put "Hotspot setup completed"

# ============================================================================
# 3. FIREWALL CONFIGURATION
# ============================================================================

:put "Configuring firewall rules..."

# Allow established connections
/ip firewall filter add chain=forward connection-state=established,related action=accept comment="Allow established connections"

# Allow hotspot to internet
/ip firewall filter add chain=forward in-interface=$hotspotInterface out-interface=$internetInterface action=accept comment="Hotspot to Internet"

# Block hotspot to LAN (security)
/ip firewall filter add chain=forward in-interface=$hotspotInterface out-interface=$lanInterface action=drop comment="Block hotspot to LAN"

# NAT rule for internet access
/ip firewall nat add chain=srcnat out-interface=$internetInterface action=masquerade comment="Hotspot NAT"

# Allow DNS queries from hotspot
/ip firewall filter add chain=input protocol=udp port=53 action=accept comment="Allow DNS"

# Allow DHCP from hotspot
/ip firewall filter add chain=input protocol=udp port=67 action=accept comment="Allow DHCP"

# Allow hotspot web interface
/ip firewall filter add chain=input protocol=tcp port=80 action=accept comment="Allow HTTP for hotspot"

:put "Firewall configuration completed"

# ============================================================================
# 4. WLAN CONFIGURATION (IF USING WIRELESS)
# ============================================================================

:put "Configuring wireless settings..."

# Configure wireless interface
/interface wireless set $hotspotInterface mode=ap-bridge \
    ssid="FastNet-WiFi" \
    frequency=auto \
    band=2ghz-b/g/n \
    channel-width=20/40mhz-Ce \
    wireless-protocol=802.11 \
    security-profile=default

# Enable wireless interface
/interface wireless enable $hotspotInterface

:put "Wireless configuration completed"

# ============================================================================
# 5. HOTSPOT USERS CONFIGURATION
# ============================================================================

:put "Configuring hotspot user authentication..."

# Use RADIUS for authentication
/ip hotspot user profile set default use-radius=yes

# Optional: Create local admin user (remove if using RADIUS only)
# /ip hotspot user add name=admin password=admin123 profile=default

:put "User authentication configured"

# ============================================================================
# 6. ADDITIONAL SETTINGS
# ============================================================================

:put "Applying additional settings..."

# Set system identity
/system identity set name="FastNet-Router"

# Configure NTP client
/system ntp client set enabled=yes primary-ntp=pool.ntp.org

# Set timezone (adjust as needed)
/system clock set time-zone-name=Africa/Nairobi

# Enable web interface (optional)
/ip service set www port=8080

# Disable unnecessary services for security
/ip service disable telnet
/ip service disable ftp
/ip service disable ssh

:put "Additional settings applied"

# ============================================================================
# 7. TESTING AND VERIFICATION
# ============================================================================

:put "Configuration completed!"
:put ""
:put "=== FastNet MikroTik Configuration Summary ==="
:put ("RADIUS Server: " . $radiusServer)
:put ("Hotspot Network: " . $hotspotNetwork)
:put ("WiFi SSID: FastNet-WiFi")
:put ("Hotspot Interface: " . $hotspotInterface)
:put ""
:put "=== Next Steps ==="
:put "1. Test RADIUS connectivity: /radius monitor numbers=0 duration=5"
:put "2. Connect a device to the WiFi network"
:put "3. Open a browser - you should see the captive portal"
:put "4. Test with RADIUS users from FastNet system"
:put ""
:put "=== Useful Commands ==="
:put "View hotspot users: /ip hotspot active print"
:put "Monitor RADIUS: /radius monitor numbers=0 duration=10"
:put "View logs: /log print where topics~\"hotspot\""
:put "Restart hotspot: /ip hotspot remove numbers=0; /ip hotspot add name=fastnet-hotspot interface=$hotspotInterface address-pool=hotspot-pool profile=fastnet-profile"

# ============================================================================
# TROUBLESHOOTING COMMANDS
# ============================================================================

# Test RADIUS connectivity
:put ""
:put "Testing RADIUS connectivity..."
/radius monitor numbers=0 duration=3

# Show current configuration
:put ""
:put "Current Hotspot Configuration:"
/ip hotspot print detail
/ip hotspot profile print detail

:put ""
:put "Configuration script completed successfully!"
:put "Check the output above for any errors."