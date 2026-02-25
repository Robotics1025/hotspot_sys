# 🚀 FastNet Hotspot System - Production Deployment Guide

## 📋 Prerequisites

### DigitalOcean Resources Required:
- ✅ **PostgreSQL Database** (Already configured)
- 🔲 **Ubuntu 22.04 Droplet** (Minimum 2GB RAM, 1 vCPU)
- 🔲 **Domain Name** (Optional but recommended)

### Local Requirements:
- Node.js 18+ 
- Git
- SSH access to your droplet

---

## 🗄️ Database Setup (Already Done ✅)

Your database is configured with:
```
Host: db-postgresql-blr1-23483-do-user-33601364-0.d.db.ondigitalocean.com
Port: 25060
Database: defaultdb  
Username: doadmin
Password: <YOUR_DATABASE_PASSWORD>
SSL: Required
```

---

## 🖥️ Step 1: Prepare Your Droplet

### 1.1 Connect to your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

### 1.2 Update system:
```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js and dependencies:
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Git
apt install -y git
```

---

## 📡 Step 2: Setup RADIUS Server

### 2.1 Download and run the RADIUS setup script:
```bash
# Download the setup script
curl -O https://raw.githubusercontent.com/your-repo/fastnet/main/scripts/setup-radius.sh

# Make it executable
chmod +x setup-radius.sh

# Run the setup (as root)
sudo ./setup-radius.sh
```

### 2.2 Verify RADIUS is running:
```bash
systemctl status freeradius
```

---

## 🚀 Step 3: Deploy FastNet Application

### 3.1 Clone your repository:
```bash
cd /opt
git clone https://github.com/your-username/fastnet-hotspot.git
cd fastnet-hotspot
```

### 3.2 Install dependencies:
```bash
npm install
```

### 3.3 Setup environment variables:
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Update these values in `.env`:**
```env
# Replace YOUR_DROPLET_IP with actual IP
NEXT_PUBLIC_APP_URL="http://YOUR_DROPLET_IP:3000"
NEXTAUTH_URL="http://YOUR_DROPLET_IP:3000"
RADIUS_SERVER_IP="YOUR_DROPLET_IP"

# Generate secure secrets (32+ characters each)
JWT_SECRET="your-production-jwt-secret-32-chars-minimum"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-minimum"
```

### 3.4 Initialize database schema:
```bash
# Run database migrations
npx drizzle-kit push:pg
```

### 3.5 Build the application:
```bash
npm run build
```

### 3.6 Start with PM2:
```bash
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
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔧 Step 4: Configure Firewall

```bash
# Enable UFW firewall
ufw --force enable

# Allow SSH (current connection)
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Allow Next.js application
ufw allow 3000

# RADIUS ports (already configured by setup script)
ufw allow 1812/udp
ufw allow 1813/udp

# Check firewall status
ufw status
```

---

## 🌐 Step 5: Setup Reverse Proxy (Optional but Recommended)

### 5.1 Install Nginx:
```bash
apt install -y nginx
```

### 5.2 Configure Nginx:
```bash
cat > /etc/nginx/sites-available/fastnet << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/fastnet /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🧪 Step 6: Testing Your Setup

### 6.1 Test Web Application:
```bash
# Check if application is running
curl http://localhost:3000

# Check via external IP
curl http://YOUR_DROPLET_IP:3000
```

### 6.2 Test RADIUS Server:
```bash
# Test RADIUS authentication
radtest testuser testpass localhost 0 testing123
```

### 6.3 Access the application:
Open your browser and navigate to:
- **Direct Access**: `http://YOUR_DROPLET_IP:3000`
- **Via Nginx**: `http://YOUR_DROPLET_IP`

### 6.4 Default Login:
- **Admin Portal**: `/admin/login`
- **Client Portal**: `/client`
- **Captive Portal**: `/login`

---

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Application Monitoring:
```bash
# Check PM2 processes
pm2 status
pm2 logs fastnet-hotspot

# Monitor system resources
htop
```

### 7.2 RADIUS Monitoring:
```bash
# Check RADIUS status
systemctl status freeradius

# View RADIUS logs
tail -f /var/log/freeradius/radius.log
```

### 7.3 Database Connection Test:
```bash
# Test PostgreSQL connection
psql "postgresql://doadmin:<YOUR_DATABASE_PASSWORD>@db-postgresql-blr1-23483-do-user-33601364-0.d.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

---

## 🛠️ Common Commands

### Application Management:
```bash
# Restart application
pm2 restart fastnet-hotspot

# Update application
cd /opt/fastnet-hotspot
git pull
npm install
npm run build
pm2 restart fastnet-hotspot

# View logs
pm2 logs fastnet-hotspot --lines 100
```

### RADIUS Management:
```bash
# Restart RADIUS
systemctl restart freeradius

# Test configuration
freeradius -X

# Add test user
echo 'testuser Cleartext-Password := "testpass"' >> /etc/freeradius/3.0/users
```

---

## 🔐 Security Checklist

- [ ] Change default passwords and secrets
- [ ] Configure firewall rules
- [ ] Enable automatic security updates
- [ ] Setup SSL/TLS certificates (Let's Encrypt)
- [ ] Configure backup procedures
- [ ] Setup monitoring and alerting
- [ ] Regular security audits

---

## 🆘 Troubleshooting

### Application Issues:
```bash
# Check application status
pm2 status
pm2 logs fastnet-hotspot

# Check database connectivity
npm run db:test
```

### RADIUS Issues:
```bash
# Debug RADIUS
systemctl stop freeradius
freeradius -X

# Check database queries
tail -f /var/log/freeradius/radius.log
```

### Network Issues:
```bash
# Check open ports
netstat -tlnp | grep -E ':(3000|1812|1813|80|443)'

# Test connectivity
telnet YOUR_DROPLET_IP 3000
```

---

## 📞 Support

If you encounter issues:
1. Check the logs first (`pm2 logs` and `/var/log/freeradius/radius.log`)
2. Verify firewall settings (`ufw status`)
3. Test database connectivity
4. Contact support with specific error messages

---

**🎉 Congratulations! Your FastNet Hotspot Management System is now production-ready!**