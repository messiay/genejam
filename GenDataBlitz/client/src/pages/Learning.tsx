import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award
} from "lucide-react";
import type { Disease, QuizQuestion, UserProgress, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Learning() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch diseases
  const { data: diseases } = useQuery<Disease[]>({
    queryKey: ["/api/diseases"],
  });

  // Fetch user progress
  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  // Fetch quiz questions for selected disease
  const { data: quizQuestions } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quiz", selectedDisease?.id],
    enabled: !!selectedDisease,
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async (data: { questionId: string; selectedAnswer: number }) => {
      return await apiRequest("POST", "/api/quiz/answer", data);
    },
    onSuccess: (data: { isCorrect: boolean; pointsEarned: number }) => {
      setShowExplanation(true);
      if (data.isCorrect) {
        toast({
          title: "Correct! 🎉",
          description: `You earned ${data.pointsEarned} points!`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = quizQuestions![currentQuestionIndex];
    submitAnswer.mutate({
      questionId: currentQuestion.id,
      selectedAnswer,
    });
  };

  const handleNextQuestion = () => {
    if (quizQuestions && currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  const currentQuestion = quizQuestions?.[currentQuestionIndex];
  const diseaseProgress = progress?.find(p => p.diseaseId === selectedDisease?.id);

  if (!selectedDisease) {
    return (
      <div className="space-y-6">
        {/* Header with User Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gamified Health Learning</h1>
            <p className="text-muted-foreground">
              Learn about diseases and earn points, badges, and achievements
            </p>
          </div>
        </div>

        {/* User Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-points">
                {user?.totalPoints || 0}
              </div>
              <p className="text-xs text-muted-foreground">Keep learning!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-level">
                {user?.level || 1}
              </div>
              <p className="text-xs text-muted-foreground">Current level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-streak">
                {user?.streak || 0}
              </div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-completed">
                {progress?.filter(p => p.completed).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Modules done</p>
            </CardContent>
          </Card>
        </div>

        {/* Disease Selection Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Choose a Disease to Learn About</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases?.map((disease) => {
              const userProgress = progress?.find(p => p.diseaseId === disease.id);
              const completionRate = userProgress
                ? (userProgress.questionsCorrect / Math.max(userProgress.questionsAttempted, 1)) * 100
                : 0;

              return (
                <Card
                  key={disease.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedDisease(disease)}
                  data-testid={`disease-card-${disease.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      {userProgress?.completed && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{disease.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {disease.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary">{disease.category}</Badge>
                      </div>
                      {disease.season && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Season</span>
                          <span className="capitalize">{disease.season}</span>
                        </div>
                      )}
                      {userProgress && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(completionRate)}%</span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      )}
                      <Button className="w-full mt-2" variant="outline">
                        {userProgress?.completed ? "Review" : "Start Learning"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        {leaderboard && leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top learners in your community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((learner, index) => (
                  <div
                    key={learner.id}
                    className={`flex items-center gap-4 p-3 rounded-md ${
                      learner.id === user?.id ? "bg-primary/10" : "bg-muted/50"
                    }`}
                    data-testid={`leaderboard-${index}`}
                  >
                    <div className="flex-shrink-0 w-8 text-center font-bold">
                      {index === 0 ? (
                        <Trophy className="h-6 w-6 mx-auto text-yellow-500" />
                      ) : index === 1 ? (
                        <Award className="h-6 w-6 mx-auto text-gray-400" />
                      ) : index === 2 ? (
                        <Award className="h-6 w-6 mx-auto text-orange-600" />
                      ) : (
                        <span className="text-muted-foreground">#{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {learner.firstName} {learner.lastName}
                        {learner.id === user?.id && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Level {learner.level} • {learner.streak} day streak
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{learner.totalPoints}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Quiz View
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => {
          setSelectedDisease(null);
          handleRestartQuiz();
        }}
        data-testid="button-back"
      >
        <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
        Back to Diseases
      </Button>

      {/* Disease Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{selectedDisease.name}</CardTitle>
          <CardDescription>{selectedDisease.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diseaseProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Your Progress</span>
                <span className="font-medium">
                  {diseaseProgress.questionsCorrect} / {diseaseProgress.questionsAttempted} correct
                </span>
              </div>
              <Progress
                value={(diseaseProgress.questionsCorrect / Math.max(diseaseProgress.questionsAttempted, 1)) * 100}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Section */}
      {quizCompleted ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground mb-6">
              Great job learning about {selectedDisease.name}
            </p>
            <Button onClick={handleRestartQuiz} data-testid="button-retake-quiz">
              Retake Quiz
            </Button>
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge>
                Question {currentQuestionIndex + 1} of {quizQuestions?.length}
              </Badge>
              <Badge variant="outline">{currentQuestion.points} points</Badge>
            </div>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctAnswer;
                const isSelected = index === selectedAnswer;
                
                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && setSelectedAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 text-left rounded-md border-2 transition-all ${
                      showExplanation
                        ? isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : isSelected
                          ? "border-red-500 bg-red-50 dark:bg-red-950"
                          : "border-border"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showExplanation && isCorrect
                            ? "border-green-500 bg-green-500"
                            : showExplanation && isSelected
                            ? "border-red-500 bg-red-500"
                            : isSelected
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {showExplanation && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                        {showExplanation && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && currentQuestion.explanation && (
              <div className="p-4 rounded-md bg-muted">
                <h4 className="font-semibold mb-2">Explanation</h4>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex gap-3">
              {!showExplanation ? (
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null || submitAnswer.isPending}
                  className="flex-1"
                  data-testid="button-submit-answer"
                >
                  {submitAnswer.isPending ? "Submitting..." : "Submit Answer"}
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="flex-1" data-testid="button-next-question">
                  {currentQuestionIndex < (quizQuestions?.length || 0) - 1
                    ? "Next Question"
                    : "Complete Quiz"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Loading quiz questions...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
