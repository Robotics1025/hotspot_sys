CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'client_admin');--> statement-breakpoint
CREATE TYPE "public"."voucher_status" AS ENUM('unused', 'active', 'expired', 'disabled');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "client_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "client_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"payout_phone_number" varchar(20),
	"balance" numeric(12, 2) DEFAULT '0.00',
	"pesapal_consumer_key" text,
	"pesapal_consumer_secret" text,
	"pesapal_ipn_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" text NOT NULL,
	"duration" integer NOT NULL,
	"speed_limit" varchar(50),
	"price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "radacct" (
	"radacctid" serial PRIMARY KEY NOT NULL,
	"acctsessionid" varchar(64) NOT NULL,
	"acctuniqueid" varchar(32) NOT NULL,
	"username" varchar(64),
	"groupname" varchar(64),
	"realm" varchar(64),
	"nasipaddress" varchar(15),
	"nasportid" varchar(15),
	"nasporttype" varchar(32),
	"acctstarttime" timestamp,
	"acctupdatetime" timestamp,
	"acctstoptime" timestamp,
	"acctinterval" integer,
	"acctsessiontime" integer,
	"acctauthentic" varchar(32),
	"connectinfo_start" varchar(50),
	"connectinfo_stop" varchar(50),
	"acctinputoctets" integer,
	"acctoutputoctets" integer,
	"calledstationid" varchar(50),
	"callingstationid" varchar(50),
	"acctterminatecause" varchar(32),
	"servicetype" varchar(32),
	"framedprotocol" varchar(32),
	"framedipaddress" varchar(15)
);
--> statement-breakpoint
CREATE TABLE "radcheck" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"attribute" varchar(64) NOT NULL,
	"op" varchar(2) DEFAULT '==' NOT NULL,
	"value" varchar(253) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radreply" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"attribute" varchar(64) NOT NULL,
	"op" varchar(2) DEFAULT '=' NOT NULL,
	"value" varchar(253) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routers" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" text NOT NULL,
	"ip" varchar(45),
	"secret" text NOT NULL,
	"version" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"voucher_id" integer,
	"amount" numeric(12, 2) NOT NULL,
	"commission" numeric(12, 2) NOT NULL,
	"payout" numeric(12, 2) NOT NULL,
	"status" varchar(20) NOT NULL,
	"pesapal_reference" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'client_admin' NOT NULL,
	"client_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"notif_email" boolean DEFAULT true NOT NULL,
	"notif_system" boolean DEFAULT true NOT NULL,
	"notif_onboarding" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"status" "voucher_status" DEFAULT 'unused',
	"consumed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routers" ADD CONSTRAINT "routers_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;