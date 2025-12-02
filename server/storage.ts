import {
  users,
  modules,
  questions,
  quizResults,
  userProgress,
  type User,
  type UpsertUser,
  type Module,
  type InsertModule,
  type Question,
  type InsertQuestion,
  type QuizResult,
  type InsertQuizResult,
  type UserProgress,
  type InsertUserProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Module operations
  getAllModules(): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;

  // Question operations
  getQuestionsByModule(moduleId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Quiz result operations
  getQuizResultsByUser(userId: string): Promise<QuizResult[]>;
  getQuizResultsByUserAndModule(userId: string, moduleId: string): Promise<QuizResult[]>;
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined>;
  upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Module operations
  async getAllModules(): Promise<Module[]> {
    return db.select().from(modules).orderBy(modules.orderIndex);
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [created] = await db
      .insert(modules)
      .values(module)
      .onConflictDoUpdate({
        target: modules.id,
        set: module,
      })
      .returning();
    return created;
  }

  // Question operations
  async getQuestionsByModule(moduleId: string): Promise<Question[]> {
    return db
      .select()
      .from(questions)
      .where(eq(questions.moduleId, moduleId))
      .orderBy(questions.orderIndex);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(question).returning();
    return created;
  }

  // Quiz result operations
  async getQuizResultsByUser(userId: string): Promise<QuizResult[]> {
    return db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(quizResults.completedAt);
  }

  async getQuizResultsByUserAndModule(userId: string, moduleId: string): Promise<QuizResult[]> {
    return db
      .select()
      .from(quizResults)
      .where(and(eq(quizResults.userId, userId), eq(quizResults.moduleId, moduleId)));
  }

  async createQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [created] = await db.insert(quizResults).values(result).returning();
    return created;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));
    return progress;
  }

  async upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserModuleProgress(progress.userId, progress.moduleId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progress,
          contentCompleted: progress.contentCompleted ?? existing.contentCompleted,
          quizCompleted: progress.quizCompleted ?? existing.quizCompleted,
          bestScore: progress.bestScore !== undefined 
            ? Math.max(progress.bestScore, existing.bestScore || 0)
            : existing.bestScore,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(userProgress).values(progress).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
