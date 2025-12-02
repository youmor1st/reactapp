import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { seedDatabase } from "./seed";
import { submitQuizSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed the database with modules and questions
  await seedDatabase();

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Module routes
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.get("/api/modules/:id/questions", isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getQuestionsByModule(req.params.id);
      // Don't send correct answers to client
      const sanitizedQuestions = questions.map(q => ({
        id: q.id,
        moduleId: q.moduleId,
        questionText: q.questionText,
        options: q.options,
        orderIndex: q.orderIndex,
      }));
      res.json(sanitizedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Progress routes
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress/:moduleId/content-completed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const moduleId = req.params.moduleId;
      
      const progress = await storage.upsertUserProgress({
        userId,
        moduleId,
        contentCompleted: true,
      });
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Quiz results routes
  app.get("/api/results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const results = await storage.getQuizResultsByUser(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.post("/api/quiz/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const parseResult = submitQuizSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid quiz data", errors: parseResult.error.errors });
      }

      const { moduleId, answers } = parseResult.data;

      // Get questions for this module
      const questions = await storage.getQuestionsByModule(moduleId);
      
      if (questions.length === 0) {
        return res.status(404).json({ message: "No questions found for this module" });
      }

      // Calculate score
      let correctCount = 0;
      const correctAnswers: number[] = [];
      
      for (const question of questions) {
        const userAnswer = answers.find(a => a.questionId === question.id);
        if (userAnswer && userAnswer.selectedAnswer === question.correctAnswer) {
          correctCount++;
        }
        correctAnswers.push(question.correctAnswer);
      }

      const totalQuestions = questions.length;
      const scorePercent = (correctCount / totalQuestions) * 100;
      const passed = scorePercent >= 60;

      // Save quiz result
      await storage.createQuizResult({
        userId,
        moduleId,
        score: correctCount,
        totalQuestions,
        passed,
      });

      // Update user progress
      await storage.upsertUserProgress({
        userId,
        moduleId,
        quizCompleted: true,
        bestScore: correctCount,
      });

      res.json({
        score: correctCount,
        totalQuestions,
        passed,
        correctAnswers,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  return httpServer;
}
