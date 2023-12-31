import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

export const mysqlTable = mysqlTableCreator((name) => `notionf_${name}`);

export const notionApiKeys = mysqlTable(
  "apikeys",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    notionApiKey: text("notion_api_key").notNull(),
    notionApiKeyName: text("notion_api_key_name"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (notionApiKeys) => {
    return {
      createdByIdIdx: index("createdById_idx").on(notionApiKeys.createdById),
    };
  },
);

export const apiKeyRelations = relations(notionApiKeys, ({ many }) => ({
  pageIds: many(notionPageIds),
}));

export const notionPageIds = mysqlTable(
  "pageids",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    notionPageId: text("notion_page_id").notNull(),
    notionDbName: text("notion_db_name"),
    notionApiKeyId: varchar("notion_api_key_id", { length: 21 })
      .references(() => notionApiKeys.id, { onDelete: "cascade" })
      .notNull(),
    public: boolean("public").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (notionPageIds) => {
    return {
      createdByIdIdx: index("createdById_idx").on(notionPageIds.createdById),
    };
  },
);

export const pageIdRelations = relations(notionPageIds, ({ one }) => ({
  notionApiKeyId: one(notionApiKeys, {
    fields: [notionPageIds.notionApiKeyId],
    references: [notionApiKeys.id],
  }),
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
