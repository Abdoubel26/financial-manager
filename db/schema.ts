import { integer, pgEnum, pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255}).notNull(),
    email: varchar("email", { length: 255}).notNull(),
    password: varchar("password").notNull(),
    image: varchar("image")
})

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", {})
})

export const typeEnum = pgEnum("type", ["expense", "income"])

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    description: varchar("description").notNull(),
    date: timestamp("date").defaultNow().notNull(),
    type: typeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    category: varchar("category").references(() => categories.name),
    user_id: uuid("user_id").references(() => users.id), 
    balance: integer("balance")
})


export const balance_histories = pgTable("totals_histories", {
    balance: integer("balance").notNull(),
    date: timestamp("date").defaultNow(),
    user_id: uuid("user_id").references(() => users.id),
    transaction_id: uuid("transaction_id").references(() => transactions.id, { onDelete: "cascade" }),
}, (table) => [primaryKey(table.transaction_id, table.user_id)])