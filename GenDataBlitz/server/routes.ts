import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPrescriptionSchema, insertHealthAlertSchema, insertDiseaseSchema, insertQuizQuestionSchema } from "@shared/schema";
import { generateHealthAlert, generateQuizQuestions } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== PRESCRIPTION ENDPOINTS =====
  
  // Submit a new prescription
  app.post("/api/prescriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "doctor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Only doctors can submit prescriptions" });
      }

      const data = insertPrescriptionSchema.parse({
        ...req.body,
        doctorId: userId,
      });

      const prescription = await storage.createPrescription(data);

      // Check if we need to generate an alert
      const recentCases = await storage.getPrescriptionsByRegion(
        data.region,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      );

      const sameDiseaseCount = recentCases.filter(
        p => p.diagnosis.toLowerCase() === data.diagnosis.toLowerCase()
      ).length;

      // Generate alert if threshold exceeded (e.g., 10 cases in a week)
      if (sameDiseaseCount >= 10) {
        const symptoms = [...new Set(recentCases.flatMap(p => p.symptoms || []))];
        const aiResponse = await generateHealthAlert(
          data.diagnosis,
          sameDiseaseCount,
          data.region,
          symptoms
        );

        await storage.createHealthAlert({
          disease: data.diagnosis,
          region: data.region,
          severity: aiResponse.severity,
          caseCount: sameDiseaseCount,
          message: aiResponse.message,
          preventiveMeasures: aiResponse.preventiveMeasures,
          symptoms,
          isActive: true,
        });
      }

      res.json(prescription);
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get recent prescriptions for current doctor
  app.get("/api/prescriptions/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prescriptions = await storage.getPrescriptionsByDoctor(userId, 20);
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  // Get doctor stats
  app.get("/api/doctor/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getPrescriptionStats(userId);
      const topDiseases = await storage.getTopDiseases(user.region || undefined, 5);
      const activeAlerts = await storage.getActiveAlerts(user.region || undefined);

      res.json({
        ...stats,
        activeAlerts: activeAlerts.length,
        topDiseases,
      });
    } catch (error) {
      console.error("Error fetching doctor stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ===== HEALTH ALERT ENDPOINTS =====
  
  // Get active health alerts
  app.get("/api/alerts/active", async (req, res) => {
    try {
      const region = req.query.region as string | undefined;
      const alerts = await storage.getActiveAlerts(region);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Create health alert (admin only)
  app.post("/api/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const data = insertHealthAlertSchema.parse(req.body);
      const alert = await storage.createHealthAlert(data);
      res.json(alert);
    } catch (error: any) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // ===== DISEASE ENDPOINTS =====
  
  // Get all diseases
  app.get("/api/diseases", async (req, res) => {
    try {
      const diseases = await storage.getAllDiseases();
      res.json(diseases);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      res.status(500).json({ message: "Failed to fetch diseases" });
    }
  });

  // Create disease with AI-generated quiz questions (admin only)
  app.post("/api/diseases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const data = insertDiseaseSchema.parse(req.body);
      const disease = await storage.createDisease(data);

      // Generate quiz questions using AI
      const questions = await generateQuizQuestions(
        disease.name,
        disease.description,
        disease.symptoms || [],
        disease.preventiveMeasures || []
      );

      // Save generated questions
      for (const q of questions) {
        await storage.createQuizQuestion({
          diseaseId: disease.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          points: q.points,
        });
      }

      res.json(disease);
    } catch (error: any) {
      console.error("Error creating disease:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // ===== QUIZ ENDPOINTS =====
  
  // Get quiz questions for a disease
  app.get("/api/quiz/:diseaseId", async (req, res) => {
    try {
      const { diseaseId } = req.params;
      const questions = await storage.getQuizQuestionsByDisease(diseaseId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  // Submit quiz answer
  app.post("/api/quiz/answer", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { questionId, selectedAnswer } = req.body;

      const question = await storage.getQuizQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const isCorrect = selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;

      // Save attempt
      await storage.createQuizAttempt({
        userId,
        questionId,
        selectedAnswer,
        isCorrect,
        pointsEarned,
      });

      // Update user progress
      const progress = await storage.getUserProgressByDisease(userId, question.diseaseId);
      
      if (progress) {
        await storage.updateProgress(userId, question.diseaseId, {
          questionsAttempted: progress.questionsAttempted + 1,
          questionsCorrect: progress.questionsCorrect + (isCorrect ? 1 : 0),
          totalPoints: progress.totalPoints + pointsEarned,
        });
      } else {
        await storage.upsertUserProgress({
          userId,
          diseaseId: question.diseaseId,
          questionsAttempted: 1,
          questionsCorrect: isCorrect ? 1 : 0,
          totalPoints: pointsEarned,
          completed: false,
        });
      }

      // Update user total points and level
      const user = await storage.getUser(userId);
      if (user) {
        const newTotalPoints = (user.totalPoints || 0) + pointsEarned;
        const newLevel = Math.floor(newTotalPoints / 100) + 1;
        
        await storage.updateUserStats(userId, {
          totalPoints: newTotalPoints,
          level: newLevel,
        });
      }

      res.json({ isCorrect, pointsEarned });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // ===== PROGRESS ENDPOINTS =====
  
  // Get user progress
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // ===== LEADERBOARD ENDPOINT =====
  
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // ===== ADMIN ENDPOINTS =====
  
  // Get admin statistics
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allPrescriptions = await storage.getAllPrescriptions(1000);
      const allAlerts = await storage.getAllAlerts(100);
      const allLearners = await storage.getUsersByRole("public");
      const allDoctors = await storage.getUsersByRole("doctor");

      // Disease distribution
      const diseaseMap = new Map<string, number>();
      allPrescriptions.forEach(p => {
        diseaseMap.set(p.diagnosis, (diseaseMap.get(p.diagnosis) || 0) + 1);
      });
      const diseaseDistribution = Array.from(diseaseMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Weekly trend
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const casesOnDay = allPrescriptions.filter(p => {
          const pDate = new Date(p.createdAt!);
          return pDate >= date && pDate < nextDate;
        }).length;

        weeklyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          cases: casesOnDay,
        });
      }

      // Regional data
      const regionMap = new Map<string, { cases: number; alerts: number }>();
      allPrescriptions.forEach(p => {
        const current = regionMap.get(p.region) || { cases: 0, alerts: 0 };
        regionMap.set(p.region, { ...current, cases: current.cases + 1 });
      });
      allAlerts.forEach(a => {
        const current = regionMap.get(a.region) || { cases: 0, alerts: 0 };
        regionMap.set(a.region, { ...current, alerts: current.alerts + 1 });
      });
      const regionalData = Array.from(regionMap.entries())
        .map(([region, data]) => ({ region, ...data }))
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 10);

      res.json({
        totalPrescriptions: allPrescriptions.length,
        totalAlerts: allAlerts.filter(a => a.isActive).length,
        totalLearners: allLearners.length,
        totalDoctors: allDoctors.length,
        diseaseDistribution,
        weeklyTrend,
        regionalData,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all alerts (admin only)
  app.get("/api/admin/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const alerts = await storage.getAllAlerts(100);
      res.json(alerts.filter(a => a.isActive));
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Get recent activity (admin only)
  app.get("/api/admin/recent-activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const prescriptions = await storage.getAllPrescriptions(50);
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
