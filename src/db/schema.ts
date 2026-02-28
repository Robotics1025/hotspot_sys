import { pgTable, serial, text, integer, timestamp, decimal, varchar, pgEnum, boolean } from "drizzle-orm/pg-core";

export const voucherStatusEnum = pgEnum("voucher_status", ["unused", "active", "expired", "disabled"]);
export const userRoleEnum = pgEnum("user_role", ["super_admin", "client_admin"]);

export const clients = pgTable("clients", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    payoutPhoneNumber: varchar("payout_phone_number", { length: 20 }),
    balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
    pesapalConsumerKey: text("pesapal_consumer_key"),
    pesapalConsumerSecret: text("pesapal_consumer_secret"),
    pesapalIpnId: text("pesapal_ipn_id"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─── Users (Super Admins & Client Admins) ───────────────────────────────────
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").default("client_admin").notNull(),
    clientId: integer("client_id").references(() => clients.id), // null = super_admin
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow(),
    // Notification preferences
    notifEmail: boolean("notif_email").default(true).notNull(),
    notifSystem: boolean("notif_system").default(true).notNull(),
    notifOnboarding: boolean("notif_onboarding").default(false).notNull(),
});

export const routers = pgTable("routers", {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").references(() => clients.id).notNull(),
    name: text("name").notNull(),
    ip: varchar("ip", { length: 45 }), // supports IPv6
    secret: text("secret").notNull(),
    version: varchar("version", { length: 10 }).notNull(), // v6 or v7
    createdAt: timestamp("created_at").defaultNow(),
});

export const plans = pgTable("plans", {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").references(() => clients.id).notNull(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(), // duration in seconds
    speedLimit: varchar("speed_limit", { length: 50 }), // e.g., "2M/2M"
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const vouchers = pgTable("vouchers", {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").references(() => clients.id).notNull(),
    planId: integer("plan_id").references(() => plans.id).notNull(),
    code: varchar("code", { length: 20 }).notNull().unique(),
    status: voucherStatusEnum("status").default("unused"),
    consumedAt: timestamp("consumed_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").references(() => clients.id).notNull(),
    voucherId: integer("voucher_id").references(() => vouchers.id),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    commission: decimal("commission", { precision: 12, scale: 2 }).notNull(), // 15%
    payout: decimal("payout", { precision: 12, scale: 2 }).notNull(), // 85%
    status: varchar("status", { length: 20 }).notNull(), // pending, completed, failed
    pesapalReference: text("pesapal_reference"),
    createdAt: timestamp("created_at").defaultNow(),
});

// RADIUS compatibility tables (simplified for Drizzle)
export const radcheck = pgTable("radcheck", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 64 }).notNull(),
    attribute: varchar("attribute", { length: 64 }).notNull(),
    op: varchar("op", { length: 2 }).default("==").notNull(),
    value: varchar("value", { length: 253 }).notNull(),
});

export const radreply = pgTable("radreply", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 64 }).notNull(),
    attribute: varchar("attribute", { length: 64 }).notNull(),
    op: varchar("op", { length: 2 }).default("=").notNull(),
    value: varchar("value", { length: 253 }).notNull(),
});

export const radacct = pgTable("radacct", {
    radacctid: serial("radacctid").primaryKey(),
    acctsessionid: varchar("acctsessionid", { length: 64 }).notNull(),
    acctuniqueid: varchar("acctuniqueid", { length: 32 }).notNull(),
    username: varchar("username", { length: 64 }),
    groupname: varchar("groupname", { length: 64 }),
    realm: varchar("realm", { length: 64 }),
    nasipaddress: varchar("nasipaddress", { length: 15 }), // IPv4
    nasportid: varchar("nasportid", { length: 15 }),
    nasporttype: varchar("nasporttype", { length: 32 }),
    acctstarttime: timestamp("acctstarttime"),
    acctupdatetime: timestamp("acctupdatetime"),
    acctstoptime: timestamp("acctstoptime"),
    acctinterval: integer("acctinterval"),
    acctsessiontime: integer("acctsessiontime"),
    acctauthentic: varchar("acctauthentic", { length: 32 }),
    connectinfo_start: varchar("connectinfo_start", { length: 50 }),
    connectinfo_stop: varchar("connectinfo_stop", { length: 50 }),
    acctinputoctets: integer("acctinputoctets"),
    acctoutputoctets: integer("acctoutputoctets"),
    calledstationid: varchar("calledstationid", { length: 50 }),
    callingstationid: varchar("callingstationid", { length: 50 }),
    acctterminatecause: varchar("acctterminatecause", { length: 32 }),
    servicetype: varchar("servicetype", { length: 32 }),
    framedprotocol: varchar("framedprotocol", { length: 32 }),
    framedipaddress: varchar("framedipaddress", { length: 15 }),
});
