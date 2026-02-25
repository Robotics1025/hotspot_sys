# 🚀 FastNet Hotspot Management System

A comprehensive, production-ready hotspot management platform built with Next.js, designed for ISPs and hotspot operators to manage WiFi vouchers, users, and billing seamlessly.

![FastNet Hotspot System](https://img.shields.io/badge/FastNet-Hotspot%20System-blue) ![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue) ![RADIUS](https://img.shields.io/badge/FreeRADIUS-3.x-green)

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔧 Management](#-management)
- [📊 Monitoring](#-monitoring)
- [🔐 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

---

## ✨ Features

### 🎯 Core Functionality
- **Multi-tenant Architecture** - Support multiple ISP clients with separate dashboards
- **RADIUS Integration** - Full FreeRADIUS server integration for authentication
- **MikroTik Support** - Native RouterOS integration with auto-configuration
- **Real-time Analytics** - Live usage statistics and revenue tracking
- **Payment Processing** - PesaPal integration for M-Pesa and card payments

### 👥 User Management
- **Admin Dashboard** - Complete system oversight and management
- **Client Portals** - Individual ISP client management interfaces  
- **End-user Portal** - Self-service voucher purchasing and management
- **Role-based Access** - Granular permissions and access controls

### 💰 Business Features
- **Flexible Pricing** - Dynamic pricing models and custom plans
- **Commission System** - Automated 85/15 revenue split with clients
- **Voucher Management** - Bulk generation and distribution
- **Transaction Tracking** - Complete audit trail and financial reporting

### 📈 Advanced Analytics
- **Revenue Dashboard** - Real-time financial metrics
- **Usage Analytics** - Bandwidth and session monitoring  
- **Client Performance** - Individual ISP performance metrics
- **Automated Reporting** - Scheduled reports and notifications

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | Next.js with App Router | 16.1.6 |
| **Backend** | Next.js API Routes | 16.1.6 |
| **Database** | PostgreSQL | 15+ |
| **ORM** | Drizzle ORM | Latest |
| **Authentication** | RADIUS (FreeRADIUS) | 3.x |
| **Payments** | PesaPal API | v3 |
| **Router Integration** | MikroTik RouterOS | 6.x/7.x |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | Latest |
| **Icons** | Lucide React | Latest |

---

## 🚀 Quick Start

### Prerequisites
- Ubuntu 22.04 LTS server (DigitalOcean Droplet)
- Domain name (optional but recommended)
- PostgreSQL database (DigitalOcean Managed Database)
- Basic Linux command line knowledge

### One-Command Deployment

```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/your-repo/fastnet/main/scripts/deploy.sh -o deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

This script will:
- Install all dependencies (Node.js, PM2, Nginx, FreeRADIUS)
- Configure the application and database
- Set up the RADIUS server
- Configure firewall and security
- Start all services

**Expected deployment time: 10-15 minutes**

---

## 📦 Installation

### Manual Installation

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional dependencies
sudo apt install -y git nginx postgresql-client
sudo npm install -g pm2
```

#### 2. Application Setup
```bash
# Clone repository
sudo git clone https://github.com/your-username/fastnet-hotspot.git /opt/fastnet-hotspot
cd /opt/fastnet-hotspot

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

#### 3. Environment Configuration
Edit `.env` file with your details:
```bash
sudo nano .env
```

#### 4. Database Setup
```bash
# Run database migrations
npm run db:push

# Initialize with sample data
./scripts/setup-database.sh
```

#### 5. RADIUS Server Setup
```bash
# Run RADIUS installation script
sudo ./scripts/setup-radius.sh
```

#### 6. Application Deployment
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

#### 7. Web Server Configuration
```bash
# Configure Nginx
sudo cp configs/nginx.conf /etc/nginx/sites-available/fastnet
sudo ln -s /etc/nginx/sites-available/fastnet /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

</details>

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Authentication secret key | `your-secret-key-32-chars` |
| `RADIUS_SERVER_IP` | RADIUS server IP address | `10.0.0.1` |
| `PESAPAL_CONSUMER_KEY` | PesaPal API consumer key | `your-pesapal-key` |
| `PESAPAL_CONSUMER_SECRET` | PesaPal API secret | `your-pesapal-secret` |

### MikroTik Router Configuration

1. **Download Configuration Script**
   ```bash
   # On your router terminal
   /tool fetch url="http://your-server/scripts/mikrotik-config.rsc"
   /import file-name=mikrotik-config.rsc
   ```

2. **Manual Configuration**
   - Copy the commands from `scripts/mikrotik-config.rsc`
   - Modify the variables at the top (server IP, interface names)
   - Execute commands via RouterOS terminal

3. **Verification**
   ```bash
   # Test RADIUS connectivity
   /radius monitor numbers=0 duration=5
   
   # View active sessions
   /ip hotspot active print
   ```

---

## 🔧 Management

### Daily Operations

#### Application Management
```bash
# Check application status
pm2 status
pm2 logs fastnet-hotspot

# Restart application
pm2 restart fastnet-hotspot

# Update application
/opt/scripts/update-fastnet.sh
```

#### System Monitoring
```bash
# Comprehensive system status
/opt/scripts/status.sh full

# Quick health check
/opt/scripts/status.sh

# Service-specific checks
/opt/scripts/status.sh services
/opt/scripts/status.sh network
/opt/scripts/status.sh database
```

#### RADIUS Management
```bash
# Check RADIUS status
sudo systemctl status freeradius

# View RADIUS logs
sudo tail -f /var/log/freeradius/radius.log

# Test RADIUS authentication
radtest username password localhost 0 testing123
```

---

## 📊 Monitoring

### System Health Dashboard

Access the comprehensive status dashboard:
```bash
/opt/scripts/status.sh full
```

**Key Metrics Monitored:**
- Application response time and memory usage
- Database connection and performance
- RADIUS server authentication success
- Network connectivity and port accessibility
- System resource utilization (CPU, memory, disk)

### Real-time Monitoring

#### Application Logs
```bash
# Live application logs
pm2 logs fastnet-hotspot --lines 100

# Error logs only
pm2 logs fastnet-hotspot --err

# JSON structured logs
pm2 logs fastnet-hotspot --json
```

---

## 🔐 Security

### Security Features

#### Built-in Security
- ✅ **HTTPS Encryption** - SSL/TLS for all communications
- ✅ **RADIUS Authentication** - Secure user authentication
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **SQL Injection Protection** - Parameterized queries via Drizzle ORM
- ✅ **XSS Prevention** - Content Security Policy headers
- ✅ **CSRF Protection** - Built-in Next.js CSRF protection

#### Network Security
```bash
# Firewall status
sudo ufw status

# Open ports (should only show necessary services)
sudo ss -tulpn
```

### Security Checklist

- [ ] Change default passwords
- [ ] Configure SSL/TLS certificates  
- [ ] Enable automatic security updates
- [ ] Regular security audits
- [ ] Monitor access logs
- [ ] Backup encryption
- [ ] Network segmentation
- [ ] Regular penetration testing

---

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs fastnet-hotspot --err

# Check environment configuration
cat /opt/fastnet-hotspot/.env
```

#### Database Connection Issues
```bash
# Test database connectivity
node -e "
const postgres = require('postgres');
const client = postgres(process.env.DATABASE_URL);
client\`SELECT 1\`.then(() => console.log('✅ DB OK')).catch(e => console.error('❌ DB Error:', e));
"
```

#### RADIUS Authentication Failures
```bash
# Debug RADIUS
sudo systemctl stop freeradius
sudo freeradius -X

# Check RADIUS logs
sudo tail -f /var/log/freeradius/radius.log

# Test authentication
radtest testuser password localhost 0 testing123
```

---

## 🤝 Contributing

We welcome contributions to FastNet! Please follow these guidelines:

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/fastnet-hotspot.git
   cd fastnet-hotspot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Development Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your development settings
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### Contribution Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages
- Create pull requests for review

---

## 📞 Support

### Getting Help

#### Documentation
- **Installation Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Configuration Guide**: This README

#### Community Support
- **Issues**: Create GitHub issues for bug reports
- **Discussions**: Community discussions and Q&A
- **Email**: support@fastnet.com

#### Professional Support
For enterprise support, custom development, or consulting services:
- **Email**: enterprise@fastnet.com
- **Website**: https://fastnet.com/support

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Drizzle Team** - For the excellent ORM
- **FreeRADIUS Community** - For the robust RADIUS server
- **MikroTik** - For RouterOS integration capabilities
- **DigitalOcean** - For reliable cloud infrastructure
- **Open Source Community** - For the countless libraries and tools

---

<div align="center">

**Built with ❤️ by the FastNet Team**

[Website](https://fastnet.com) • [Documentation](https://docs.fastnet.com) • [Support](mailto:support@fastnet.com)

</div>
