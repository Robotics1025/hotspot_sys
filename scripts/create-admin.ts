#!/usr/bin/env ts-node
/**
 * FastNet — Create Admin User
 * Run from project root: npx ts-node scripts/create-admin.ts
 */

import * as readline from 'readline';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

function askHidden(question: string): Promise<string> {
    return new Promise((resolve) => {
        process.stdout.write(question);
        process.stdin.setRawMode(true);
        process.stdin.resume();

        let input = '';
        const onData = (char: Buffer) => {
            const c = char.toString();
            if (c === '\n' || c === '\r' || c === '\u0003') {
                if (c === '\u0003') process.exit();
                process.stdout.write('\n');
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener('data', onData);
                resolve(input);
            } else if (c === '\u007F') {
                if (input.length > 0) {
                    input = input.slice(0, -1);
                    process.stdout.write('\b \b');
                }
            } else {
                input += c;
                process.stdout.write('*');
            }
        };

        process.stdin.on('data', onData);
    });
}

async function main() {
    console.log('\n╔════════════════════════════════════╗');
    console.log('║   FastNet — Create Admin Account   ║');
    console.log('╚════════════════════════════════════╝\n');

    if (!process.env.DATABASE_URL) {
        console.error('❌  DATABASE_URL is not set in .env');
        process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        // Test DB connection
        await pool.query('SELECT 1');
        console.log('✅  Database connected\n');
    } catch (err) {
        console.error('❌  Could not connect to database:', err);
        process.exit(1);
    }

    const username = await ask('Enter admin username: ');
    const email = await ask('Enter admin email: ');
    const password = await askHidden('Enter admin password: ');
    const confirm = await askHidden('Confirm password: ');

    rl.close();

    if (!username || !email || !password) {
        console.error('\n❌  All fields are required.');
        process.exit(1);
    }

    if (password !== confirm) {
        console.error('\n❌  Passwords do not match.');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('\n❌  Password must be at least 8 characters.');
        process.exit(1);
    }

    // Check for duplicate
    const existing = await pool.query(
        'SELECT id FROM admin_users WHERE username = $1 OR email = $2',
        [username, email]
    );
    if (existing.rows.length > 0) {
        console.error('\n❌  An admin with that username or email already exists.');
        await pool.end();
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
        'INSERT INTO admin_users (username, email, password_hash) VALUES ($1, $2, $3)',
        [username, email, passwordHash]
    );

    await pool.end();

    console.log('\n✅  Admin account created successfully!');
    console.log(`   Username : ${username}`);
    console.log(`   Email    : ${email}`);
    console.log('\n   You can now log in at /admin/login\n');
}

main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
