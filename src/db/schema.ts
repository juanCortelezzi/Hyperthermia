import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description", { length: 100 }).notNull().unique(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
});
