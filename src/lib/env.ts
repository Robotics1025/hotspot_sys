import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),
    
    // Security
    JWT_SECRET: z.string().min(32),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    
    // PesaPal (optional for now)
    PESAPAL_CONSUMER_KEY: z.string().optional(),
    PESAPAL_CONSUMER_SECRET: z.string().optional(),
    PESAPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
    PESAPAL_IPN_URL: z.string().url().optional(),
    
    // RADIUS
    RADIUS_SERVER_IP: z.string().ip().optional(),
    RADIUS_SECRET: z.string().default('FastNet-Radius-2026'),
    RADIUS_AUTH_PORT: z.string().default('1812'),
    RADIUS_ACCT_PORT: z.string().default('1813'),
    
    // Application
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate environment variables
function parseEnv() {
    try {
        return envSchema.parse({
            DATABASE_URL: process.env.DATABASE_URL,
            JWT_SECRET: process.env.JWT_SECRET,
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            PESAPAL_CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY,
            PESAPAL_CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET,
            PESAPAL_MODE: process.env.PESAPAL_MODE,
            PESAPAL_IPN_URL: process.env.PESAPAL_IPN_URL,
            RADIUS_SERVER_IP: process.env.RADIUS_SERVER_IP,
            RADIUS_SECRET: process.env.RADIUS_SECRET,
            RADIUS_AUTH_PORT: process.env.RADIUS_AUTH_PORT,
            RADIUS_ACCT_PORT: process.env.RADIUS_ACCT_PORT,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            NODE_ENV: process.env.NODE_ENV,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:')
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`)
            })
            process.exit(1)
        }
        throw error
    }
}

// Export validated environment variables
export const env = parseEnv()

// Database connection helper
export const dbConfig = {
    connectionString: env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for DigitalOcean managed databases
    }
}

// RADIUS configuration helper
export const radiusConfig = {
    host: env.RADIUS_SERVER_IP || 'localhost',
    secret: env.RADIUS_SECRET,
    authPort: parseInt(env.RADIUS_AUTH_PORT),
    acctPort: parseInt(env.RADIUS_ACCT_PORT),
}

// PesaPal configuration helper
export const pesapalConfig = {
    consumerKey: env.PESAPAL_CONSUMER_KEY || '',
    consumerSecret: env.PESAPAL_CONSUMER_SECRET || '',
    mode: env.PESAPAL_MODE,
    baseUrl: env.PESAPAL_MODE === 'live' 
        ? 'https://pay.pesapal.com/v3'
        : 'https://cybqa.pesapal.com/v3',
    ipnUrl: env.PESAPAL_IPN_URL || '',
}