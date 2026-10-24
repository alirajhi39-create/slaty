import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentName: text("student_name").notNull(),
  studentClass: text("student_class").notNull().default(""),
  answers: jsonb("answers").notNull(),
  autoScore: integer("auto_score").notNull().default(0),
  autoTotal: integer("auto_total").notNull().default(0),
  manualScore: integer("manual_score"),
  manualTotal: integer("manual_total").notNull().default(0),
  feedback: text("feedback").notNull().default(""),
  reviewed: boolean("reviewed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
