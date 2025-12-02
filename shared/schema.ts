import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Note: sessions table is managed by connect-pg-simple, not by drizzle

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(), // hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Modules table - stores the 4 educational modules
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  icon: varchar("icon").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const insertModuleSchema = createInsertSchema(modules);
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// Questions table - stores quiz questions for each module
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Quiz results table - stores user quiz attempts
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true, completedAt: true });
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// User progress table - tracks module completion
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  contentCompleted: boolean("content_completed").default(false),
  quizCompleted: boolean("quiz_completed").default(false),
  bestScore: integer("best_score"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, updatedAt: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// Quiz answer submission schema
export const submitQuizSchema = z.object({
  moduleId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.number(),
  })),
});
export type SubmitQuiz = z.infer<typeof submitQuizSchema>;

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Жарамсыз email мекенжайы"),
  password: z.string().min(8, "Құпия сөз кемінде 8 таңбадан тұруы керек"),
  firstName: z.string().min(1, "Атыңызды енгізіңіз"),
  lastName: z.string().min(1, "Тегіңізді енгізіңіз"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Жарамсыз email мекенжайы"),
  password: z.string().min(1, "Құпия сөзді енгізіңіз"),
});
export type LoginInput = z.infer<typeof loginSchema>;
