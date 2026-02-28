-- Add notification preference columns to users table
ALTER TABLE users ADD COLUMN notif_email boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN notif_system boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN notif_onboarding boolean NOT NULL DEFAULT false;