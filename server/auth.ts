import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler, Request } from "express";
import SQLiteStore from "connect-sqlite3";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { registerSchema, loginSchema, verifyEmailSchema } from "@shared/schema";
import { sendVerificationEmail } from "./email";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const SQLiteStoreSession = SQLiteStore(session);
  const dbPath = process.env.DATABASE_PATH || "./database.sqlite";
  const sessionStore = new SQLiteStoreSession({
    db: dbPath,
    table: "sessions",
    dir: "./",
  });
  return session({
    secret: process.env.SESSION_SECRET || "change-this-secret-key-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for login
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Email немесе құпия сөз дұрыс емес" });
          }

          if (!user.emailVerified) {
            return done(null, false, { message: "Email расталмаған. Растау хатын тексеріңіз." });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Email немесе құпия сөз дұрыс емес" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Деректер дұрыс емес",
          errors: parseResult.error.errors,
        });
      }

      const { email, password, firstName, lastName } = parseResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Бұл email бойынша тіркелген пайдаланушы бар" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = randomBytes(32).toString("hex");
      const verificationTokenExpires = new Date();
      verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24 hours

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      });

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken, firstName || "Қолданушы");
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        message: "Тіркелу сәтті! Растау хатын тексеріңіз.",
        userId: user.id,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Тіркелу кезінде қате орын алды" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Деректер дұрыс емес",
        errors: parseResult.error.errors,
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Кіру кезінде қате орын алды" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Кіру сәтсіз" });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Кіру кезінде қате орын алды" });
        }
        return res.json({
          message: "Кіру сәтті",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
          },
        });
      });
    })(req, res, next);
  });

  // Verify email endpoint
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const parseResult = verifyEmailSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Деректер дұрыс емес",
          errors: parseResult.error.errors,
        });
      }

      const { token } = parseResult.data;

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Жарамсыз немесе мерзімі өткен токен" });
      }

      if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
        return res.status(400).json({ message: "Токен мерзімі өткен" });
      }

      await storage.updateUser(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      });

      res.json({ message: "Email сәтті расталды" });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Email растау кезінде қате орын алды" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Шығу сәтті" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Авторизация қажет" });
  }

  const user = req.user as any;
  if (!user.emailVerified) {
    return res.status(403).json({ message: "Email расталмаған" });
  }

  return next();
};

