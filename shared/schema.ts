import {
  index,
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Note: sessions table is managed by connect-sqlite3, not by drizzle

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // hashed password
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpires: integer("verification_token_expires", { mode: "timestamp" }),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: integer("reset_password_expires", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Modules table - stores the 4 educational modules
export const modules = sqliteTable("modules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  icon: text("icon").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const insertModuleSchema = createInsertSchema(modules);
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// Questions table - stores quiz questions for each module
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey().$defaultFn(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }),
  moduleId: text("module_id").notNull().references(() => modules.id),
  questionText: text("question_text").notNull(),
  options: text("options", { mode: "json" }).notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Quiz results table - stores user quiz attempts
export const quizResults = sqliteTable("quiz_results", {
  id: text("id").primaryKey().$defaultFn(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }),
  userId: text("user_id").notNull().references(() => users.id),
  moduleId: text("module_id").notNull().references(() => modules.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true, completedAt: true });
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// User progress table - tracks module completion
export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey().$defaultFn(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }),
  userId: text("user_id").notNull().references(() => users.id),
  moduleId: text("module_id").notNull().references(() => modules.id),
  contentCompleted: integer("content_completed", { mode: "boolean" }).default(false),
  quizCompleted: integer("quiz_completed", { mode: "boolean" }).default(false),
  bestScore: integer("best_score"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
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

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Токен табылмады"),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
