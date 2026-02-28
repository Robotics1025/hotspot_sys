-- Migration: Add notification fields to users table
ALTER TABLE users
ADD COLUMN notif_email BOOLEAN DEFAULT TRUE,
ADD COLUMN notif_system BOOLEAN DEFAULT TRUE,
ADD COLUMN notif_onboarding BOOLEAN DEFAULT FALSE;