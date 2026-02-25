# 📋 FastNet Hotspot System - Production Deployment Checklist

## 🎯 Your Current Status

✅ **Development Complete** - All system components built and tested  
✅ **Database Configured** - PostgreSQL database with DigitalOcean credentials  
✅ **Environment Files Created** - Production configuration ready  
✅ **Scripts Generated** - All deployment and management scripts created  

---

## 🚀 Next Steps for Production Deployment

### Step 1: Prepare Your DigitalOcean Droplet

1. **Create Ubuntu 22.04 Droplet** (if not already done)
   - Minimum: 2GB RAM, 1 vCPU, 25GB SSD
   - Recommended: 4GB RAM, 2 vCPU, 50GB SSD
   - Enable monitoring and backups

2. **Initial Droplet Setup**
   ```bash
   # SSH into your droplet
   ssh root@YOUR_DROPLET_IP
   
   # Update system
   apt update && apt upgrade -y
   
   # Create non-root user (optional but recommended)
   adduser fastnet
   usermod -aG sudo fastnet
   ```

### Step 2: Upload Your FastNet Code

**Option A: Using Git (Recommended)**
```bash
# On your droplet
cd /opt
git clone https://github.com/your-username/fastnet-hotspot.git
cd fastnet-hotspot

# Upload your local changes
git add .
git commit -m "Production configuration"
git push origin main
```

**Option B: Direct Upload**
```bash
# On your local machine
scp -r ./hotspot_sys root@YOUR_DROPLET_IP:/opt/fastnet-hotspot
```

### Step 3: Run Automated Deployment

```bash
# On your droplet
cd /opt/fastnet-hotspot
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

**This will automatically:**
- Install Node.js, PM2, Nginx, FreeRADIUS
- Configure all services
- Set up database schema
- Start the application
- Configure firewall

### Step 4: Initialize Database with Sample Data

```bash
# After deployment completes
cd /opt/fastnet-hotspot
chmod +x scripts/setup-database.sh
sudo ./scripts/setup-database.sh
```

**This creates:**
- Admin user: `admin@fastnet.com` / `admin123`
- Sample client: `demo@example.com` / `client123`
- Sample subscription plans
- RADIUS test users

### Step 5: Configure Your MikroTik Router

1. **Update the configuration script**
   ```bash
   # Edit the script with your server IP
   nano scripts/mikrotik-config.rsc
   
   # Replace YOUR_FASTNET_SERVER_IP with your actual droplet IP
   ```

2. **Apply configuration to your router**
   ```bash
   # On the MikroTik router terminal
   /tool fetch url="http://YOUR_DROPLET_IP/scripts/mikrotik-config.rsc"
   /import file-name=mikrotik-config.rsc
   ```

3. **Test RADIUS connectivity**
   ```bash
   # On the router
   /radius monitor numbers=0 duration=5
   ```

---

## ✅ Post-Deployment Verification

### 1. Check System Health
```bash
# Run comprehensive status check
/opt/scripts/status.sh full
```

### 2. Test Web Access
- **Admin Panel**: http://YOUR_DROPLET_IP/admin
- **Client Portal**: http://YOUR_DROPLET_IP/client  
- **Captive Portal**: http://YOUR_DROPLET_IP/login

### 3. Test RADIUS Authentication
```bash
# Test with sample users
radtest testuser1 password123 localhost 0 testing123
radtest demo demopass localhost 0 testing123
```

### 4. Monitor Services
```bash
# Application status
pm2 status
pm2 logs fastnet-hotspot

# System services
sudo systemctl status nginx
sudo systemctl status freeradius
```

---

## 🔧 Essential Management Commands

### Daily Monitoring
```bash
# Quick health check
/opt/scripts/status.sh

# View application logs
pm2 logs fastnet-hotspot --lines 50

# Check RADIUS logs
sudo tail -f /var/log/freeradius/radius.log
```

### Maintenance
```bash
# Update application
/opt/scripts/update-fastnet.sh

# Create backup
/opt/scripts/backup-fastnet.sh

# Restart services
pm2 restart fastnet-hotspot
sudo systemctl restart nginx
sudo systemctl restart freeradius
```

---

## 🛡️ Security Configuration (Important!)

### 1. Change Default Passwords
```bash
# Access admin panel and change:
# admin@fastnet.com password
# demo@example.com password
```

### 2. Configure SSL/TLS (Highly Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 3. Firewall Verification
```bash
# Check firewall status
sudo ufw status

# Should show these open ports:
# 22/tcp (SSH)
# 80/tcp (HTTP)
# 443/tcp (HTTPS)
# 1812/udp (RADIUS Auth)
# 1813/udp (RADIUS Acct)
```

---

## 📊 Expected Performance

### System Resources
- **Memory Usage**: ~200-500MB for application
- **CPU Usage**: <10% during normal operation
- **Disk Space**: ~1GB for application + logs
- **Network**: Minimal bandwidth for RADIUS auth

### Scaling Capacity
- **Concurrent Users**: 1000+ with 2GB RAM droplet
- **RADIUS Requests**: 500+ per second
- **Database Connections**: Pooled for efficiency

---

## 🆘 If Something Goes Wrong

### Common Issues & Solutions

1. **Application won't start**
   ```bash
   # Check PM2 status and logs
   pm2 status
   pm2 logs fastnet-hotspot --err
   
   # Check environment file
   cat /opt/fastnet-hotspot/.env
   ```

2. **Database connection errors**
   ```bash
   # Test database connectivity
   cd /opt/fastnet-hotspot
   node -e "
   const postgres = require('postgres');
   const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
   client\`SELECT 1\`.catch(console.error);
   "
   ```

3. **RADIUS authentication fails**
   ```bash
   # Debug RADIUS
   sudo systemctl stop freeradius
   sudo freeradius -X
   ```

4. **Can't access web interface**
   ```bash
   # Check if application is running
   curl http://localhost:3000
   
   # Check Nginx
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Get Help
- Review logs: `/opt/fastnet-hotspot/logs/`
- Check system status: `/opt/scripts/status.sh full`
- Contact support: Include error messages and system info

---

## 🎉 Success Indicators

You'll know everything is working when:

- [ ] Web interfaces load without errors
- [ ] Admin can login at `/admin`
- [ ] RADIUS tests pass: `radtest testuser1 password123 localhost 0 testing123`
- [ ] MikroTik shows "Connected" RADIUS status
- [ ] Devices connecting to WiFi see captive portal
- [ ] Status script shows all services "✅ OK"

---

## 🔮 What's Next?

### Production Optimization
1. **Domain Setup**: Point your domain to the droplet IP
2. **SSL Configuration**: Enable HTTPS for security
3. **Monitoring**: Set up alerts and monitoring
4. **Backups**: Schedule automated backups
5. **Scaling**: Monitor usage and scale as needed

### Business Operations
1. **Client Onboarding**: Add real ISP clients
2. **Payment Setup**: Configure PesaPal for live transactions  
3. **Plan Configuration**: Create your subscription plans
4. **Router Deployment**: Configure client MikroTik routers
5. **Support Setup**: Establish customer support processes

---

## 📞 Support & Resources

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **System Status**: `/opt/scripts/status.sh`
- **Logs Location**: `/opt/fastnet-hotspot/logs/`
- **Configuration**: `/opt/fastnet-hotspot/.env`

**Ready to deploy? Run the deployment script on your droplet!**

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/fastnet/main/scripts/deploy.sh -o deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```