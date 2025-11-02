import {
  users,
  prescriptions,
  healthAlerts,
  diseases,
  quizQuestions,
  userProgress,
  quizAttempts,
  type User,
  type UpsertUser,
  type Prescription,
  type InsertPrescription,
  type HealthAlert,
  type InsertHealthAlert,
  type Disease,
  type InsertDisease,
  type QuizQuestion,
  type InsertQuizQuestion,
  type UserProgress,
  type InsertUserProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserStats(userId: string, stats: { totalPoints?: number; level?: number; streak?: number }): Promise<void>;
  getLeaderboard(limit: number): Promise<User[]>;

  // Prescription operations
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  getPrescriptionsByDoctor(doctorId: string, limit?: number): Promise<Prescription[]>;
  getPrescriptionsByRegion(region: string, startDate?: Date): Promise<Prescription[]>;
  getAllPrescriptions(limit?: number): Promise<Prescription[]>;
  getPrescriptionStats(doctorId: string): Promise<{ todayEntries: number; weekEntries: number }>;
  getTopDiseases(region?: string, limit?: number): Promise<Array<{ disease: string; count: number }>>;

  // Health alert operations
  createHealthAlert(alert: InsertHealthAlert): Promise<HealthAlert>;
  getActiveAlerts(region?: string): Promise<HealthAlert[]>;
  getAllAlerts(limit?: number): Promise<HealthAlert[]>;
  deactivateAlert(id: string): Promise<void>;

  // Disease operations
  createDisease(disease: InsertDisease): Promise<Disease>;
  getDiseaseByName(name: string): Promise<Disease | undefined>;
  getAllDiseases(): Promise<Disease[]>;
  getDiseaseById(id: string): Promise<Disease | undefined>;

  // Quiz operations
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  getQuizQuestionsByDisease(diseaseId: string): Promise<QuizQuestion[]>;
  getQuizQuestionById(id: string): Promise<QuizQuestion | undefined>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressByDisease(userId: string, diseaseId: string): Promise<UserProgress | undefined>;
  upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateProgress(userId: string, diseaseId: string, updates: Partial<UserProgress>): Promise<void>;

  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserAttempts(userId: string): Promise<QuizAttempt[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async updateUserStats(userId: string, stats: { totalPoints?: number; level?: number; streak?: number }): Promise<void> {
    await db
      .update(users)
      .set({
        ...stats,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.totalPoints), desc(users.level))
      .limit(limit);
  }

  // Prescription operations
  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [result] = await db.insert(prescriptions).values(prescription).returning();
    return result;
  }

  async getPrescriptionsByDoctor(doctorId: string, limit: number = 20): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt))
      .limit(limit);
  }

  async getPrescriptionsByRegion(region: string, startDate?: Date): Promise<Prescription[]> {
    if (startDate) {
      return await db
        .select()
        .from(prescriptions)
        .where(and(eq(prescriptions.region, region), gte(prescriptions.createdAt, startDate)));
    }
    return await db.select().from(prescriptions).where(eq(prescriptions.region, region));
  }

  async getAllPrescriptions(limit: number = 100): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .orderBy(desc(prescriptions.createdAt))
      .limit(limit);
  }

  async getPrescriptionStats(doctorId: string): Promise<{ todayEntries: number; weekEntries: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(prescriptions)
      .where(and(eq(prescriptions.doctorId, doctorId), gte(prescriptions.createdAt, today)));

    const [weekResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(prescriptions)
      .where(and(eq(prescriptions.doctorId, doctorId), gte(prescriptions.createdAt, weekAgo)));

    return {
      todayEntries: todayResult?.count || 0,
      weekEntries: weekResult?.count || 0,
    };
  }

  async getTopDiseases(region?: string, limit: number = 5): Promise<Array<{ disease: string; count: number }>> {
    const query = db
      .select({
        disease: prescriptions.diagnosis,
        count: sql<number>`count(*)::int`,
      })
      .from(prescriptions)
      .groupBy(prescriptions.diagnosis)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    if (region) {
      return await query.where(eq(prescriptions.region, region));
    }
    return await query;
  }

  // Health alert operations
  async createHealthAlert(alert: InsertHealthAlert): Promise<HealthAlert> {
    const [result] = await db.insert(healthAlerts).values(alert).returning();
    return result;
  }

  async getActiveAlerts(region?: string): Promise<HealthAlert[]> {
    let query = db
      .select()
      .from(healthAlerts)
      .where(eq(healthAlerts.isActive, true))
      .orderBy(desc(healthAlerts.createdAt));

    if (region) {
      return await query.where(and(eq(healthAlerts.isActive, true), eq(healthAlerts.region, region)));
    }
    return await query;
  }

  async getAllAlerts(limit: number = 50): Promise<HealthAlert[]> {
    return await db
      .select()
      .from(healthAlerts)
      .orderBy(desc(healthAlerts.createdAt))
      .limit(limit);
  }

  async deactivateAlert(id: string): Promise<void> {
    await db.update(healthAlerts).set({ isActive: false }).where(eq(healthAlerts.id, id));
  }

  // Disease operations
  async createDisease(disease: InsertDisease): Promise<Disease> {
    const [result] = await db.insert(diseases).values(disease).returning();
    return result;
  }

  async getDiseaseByName(name: string): Promise<Disease | undefined> {
    const [disease] = await db.select().from(diseases).where(eq(diseases.name, name));
    return disease;
  }

  async getAllDiseases(): Promise<Disease[]> {
    return await db.select().from(diseases).orderBy(diseases.name);
  }

  async getDiseaseById(id: string): Promise<Disease | undefined> {
    const [disease] = await db.select().from(diseases).where(eq(diseases.id, id));
    return disease;
  }

  // Quiz operations
  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [result] = await db.insert(quizQuestions).values(question).returning();
    return result;
  }

  async getQuizQuestionsByDisease(diseaseId: string): Promise<QuizQuestion[]> {
    return await db.select().from(quizQuestions).where(eq(quizQuestions.diseaseId, diseaseId));
  }

  async getQuizQuestionById(id: string): Promise<QuizQuestion | undefined> {
    const [question] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));
    return question;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserProgressByDisease(userId: string, diseaseId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.diseaseId, diseaseId)));
    return progress;
  }

  async upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [result] = await db
      .insert(userProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.diseaseId],
        set: {
          questionsAttempted: progress.questionsAttempted,
          questionsCorrect: progress.questionsCorrect,
          totalPoints: progress.totalPoints,
          completed: progress.completed,
          lastAttemptedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async updateProgress(userId: string, diseaseId: string, updates: Partial<UserProgress>): Promise<void> {
    await db
      .update(userProgress)
      .set({
        ...updates,
        lastAttemptedAt: new Date(),
      })
      .where(and(eq(userProgress.userId, userId), eq(userProgress.diseaseId, diseaseId)));
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [result] = await db.insert(quizAttempts).values(attempt).returning();
    return result;
  }

  async getUserAttempts(userId: string): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.createdAt));
  }
}

export const storage = new DatabaseStorage();
