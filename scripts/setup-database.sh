#!/bin/bash

# Database Migration and Setup Script for FastNet Hotspot System
# This script initializes the database with the required schema and test data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "drizzle.config.ts" ]; then
        error "This script must be run from the project root directory"
    fi
}

# Load environment variables
load_env() {
    if [ -f ".env" ]; then
        export $(cat .env | xargs)
        log "Environment variables loaded"
    else
        error ".env file not found. Please run deployment script first."
    fi
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    # Use Node.js to test the connection
    node -e "
        const { drizzle } = require('drizzle-orm/postgres-js');
        const postgres = require('postgres');
        
        const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
        const db = drizzle(client);
        
        (async () => {
            try {
                await client\`SELECT 1\`;
                console.log('✅ Database connection successful');
                process.exit(0);
            } catch (error) {
                console.error('❌ Database connection failed:', error.message);
                process.exit(1);
            }
        })();
    " || error "Database connection test failed"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Push schema to database
    npx drizzle-kit push:pg || error "Database migration failed"
    
    log "Database schema created successfully"
}

# Create initial admin user
create_admin_user() {
    log "Creating initial admin user..."
    
    # Hash password using Node.js bcrypt
    HASHED_PASSWORD=$(node -e "
        const bcrypt = require('bcryptjs');
        console.log(bcrypt.hashSync('admin123', 12));
    ")
    
    # Insert admin user
    node -e "
        const { drizzle } = require('drizzle-orm/postgres-js');
        const postgres = require('postgres');
        const { users } = require('./src/db/schema.ts');
        
        const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
        const db = drizzle(client);
        
        (async () => {
            try {
                await db.insert(users).values({
                    name: 'Administrator',
                    email: 'admin@fastnet.com',
                    password: '$HASHED_PASSWORD',
                    role: 'admin',
                    isActive: true
                }).onConflictDoNothing();
                
                console.log('✅ Admin user created: admin@fastnet.com / admin123');
                process.exit(0);
            } catch (error) {
                console.error('❌ Failed to create admin user:', error.message);
                process.exit(1);
            }
        })();
    " || warn "Admin user creation failed (may already exist)"
}

# Create sample plans
create_sample_plans() {
    log "Creating sample subscription plans..."
    
    node -e "
        const { drizzle } = require('drizzle-orm/postgres-js');
        const postgres = require('postgres');
        const { plans } = require('./src/db/schema.ts');
        
        const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
        const db = drizzle(client);
        
        const samplePlans = [
            {
                name: 'Basic',
                price: 500,
                duration: 30,
                bandwidth: '10 Mbps',
                description: 'Basic internet access for light browsing',
                isActive: true
            },
            {
                name: 'Standard',
                price: 1000,
                duration: 30,
                bandwidth: '25 Mbps',
                description: 'Standard speed for streaming and downloads',
                isActive: true
            },
            {
                name: 'Premium',
                price: 2000,
                duration: 30,
                bandwidth: '50 Mbps',
                description: 'High-speed internet for heavy usage',
                isActive: true
            },
            {
                name: 'Daily Pass',
                price: 50,
                duration: 1,
                bandwidth: '15 Mbps',
                description: '24-hour internet access pass',
                isActive: true
            },
            {
                name: 'Weekly Pass',
                price: 300,
                duration: 7,
                bandwidth: '20 Mbps',
                description: '7-day internet access pass',
                isActive: true
            }
        ];
        
        (async () => {
            try {
                for (const plan of samplePlans) {
                    await db.insert(plans).values(plan).onConflictDoNothing();
                }
                console.log('✅ Sample plans created');
                process.exit(0);
            } catch (error) {
                console.error('❌ Failed to create sample plans:', error.message);
                process.exit(1);
            }
        })();
    " || warn "Sample plans creation failed"
}

# Create sample client
create_sample_client() {
    log "Creating sample client..."
    
    # Hash password
    CLIENT_PASSWORD=$(node -e "
        const bcrypt = require('bcryptjs');
        console.log(bcrypt.hashSync('client123', 12));
    ")
    
    node -e "
        const { drizzle } = require('drizzle-orm/postgres-js');
        const postgres = require('postgres');
        const { clients } = require('./src/db/schema.ts');
        
        const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
        const db = drizzle(client);
        
        (async () => {
            try {
                await db.insert(clients).values({
                    name: 'Demo ISP',
                    email: 'demo@example.com',
                    phone: '+254700000000',
                    password: '$CLIENT_PASSWORD',
                    businessName: 'Demo Internet Services',
                    location: 'Nairobi, Kenya',
                    commissionRate: 85.0,
                    isActive: true
                }).onConflictDoNothing();
                
                console.log('✅ Sample client created: demo@example.com / client123');
                process.exit(0);
            } catch (error) {
                console.error('❌ Failed to create sample client:', error.message);
                process.exit(1);
            }
        })();
    " || warn "Sample client creation failed"
}

# Create RADIUS test users
create_radius_test_users() {
    log "Creating RADIUS test users..."
    
    # Add test users to FreeRADIUS
    cat >> /etc/freeradius/3.0/users << 'EOF'
# FastNet Test Users
testuser1 Cleartext-Password := "password123"
    Reply-Message := "Welcome to FastNet Hotspot",
    Session-Timeout := 3600

testuser2 Cleartext-Password := "demo2023"
    Reply-Message := "Welcome to FastNet Hotspot",
    Session-Timeout := 7200

demo Cleartext-Password := "demopass"
    Reply-Message := "Demo User - FastNet Hotspot",
    Session-Timeout := 1800
EOF

    # Restart FreeRADIUS to load new users
    systemctl restart freeradius || warn "Could not restart FreeRADIUS (may not be running)"
    
    log "RADIUS test users created"
}

# Verify setup
verify_setup() {
    log "Verifying database setup..."
    
    # Count records in main tables
    node -e "
        const { drizzle } = require('drizzle-orm/postgres-js');
        const postgres = require('postgres');
        const { users, clients, plans } = require('./src/db/schema.ts');
        const { count } = require('drizzle-orm');
        
        const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
        const db = drizzle(client);
        
        (async () => {
            try {
                const userCount = await db.select({ count: count() }).from(users);
                const clientCount = await db.select({ count: count() }).from(clients);
                const planCount = await db.select({ count: count() }).from(plans);
                
                console.log(\`📊 Database Summary:\`);
                console.log(\`   • Users: \${userCount[0].count}\`);
                console.log(\`   • Clients: \${clientCount[0].count}\`);
                console.log(\`   • Plans: \${planCount[0].count}\`);
                
                process.exit(0);
            } catch (error) {
                console.error('❌ Verification failed:', error.message);
                process.exit(1);
            }
        })();
    " || error "Database verification failed"
}

# Test RADIUS server
test_radius() {
    log "Testing RADIUS server..."
    
    # Test RADIUS authentication
    if radtest testuser1 password123 localhost 0 testing123 > /dev/null 2>&1; then
        log "✅ RADIUS authentication test passed"
    else
        warn "❌ RADIUS authentication test failed"
    fi
}

# Main function
main() {
    log "Starting FastNet database initialization..."
    
    check_directory
    load_env
    test_connection
    run_migrations
    create_admin_user
    create_sample_plans
    create_sample_client
    create_radius_test_users
    verify_setup
    test_radius
    
    echo
    echo "🎉 Database initialization completed successfully!"
    echo
    echo "🔐 Default Credentials:"
    echo "   • Admin Portal: admin@fastnet.com / admin123"
    echo "   • Sample Client: demo@example.com / client123"
    echo
    echo "📡 RADIUS Test Users:"
    echo "   • testuser1 / password123"
    echo "   • testuser2 / demo2023" 
    echo "   • demo / demopass"
    echo
    echo "🌐 Access Points:"
    echo "   • Admin: http://$(curl -s http://checkip.amazonaws.com)/admin"
    echo "   • Client: http://$(curl -s http://checkip.amazonaws.com)/client"
    echo "   • Captive Portal: http://$(curl -s http://checkip.amazonaws.com)/login"
    echo
    echo "⚠️  Security Notice:"
    echo "   Change default passwords before production use!"
    echo
}

# Run main function
main "$@"