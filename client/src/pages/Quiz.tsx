import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  GraduationCap, 
  ArrowLeft, 
  ArrowRight, 
  Home,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  BookOpen
} from "lucide-react";
import type { Module, Question } from "@shared/schema";

interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
}

interface QuizResultData {
  score: number;
  totalQuestions: number;
  passed: boolean;
  correctAnswers: number[];
}

export default function QuizPage() {
  const [, params] = useRoute("/quiz/:id");
  const moduleId = params?.id;
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: module, isLoading: moduleLoading } = useQuery<Module>({
    queryKey: ["/api/modules", moduleId],
    enabled: !!moduleId,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/modules", moduleId, "questions"],
    enabled: !!moduleId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: { moduleId: string; answers: QuizAnswer[] }) => {
      const response = await apiRequest("POST", "/api/quiz/submit", data);
      return (await response.json()) as QuizResultData;
    },
    onSuccess: (result) => {
      setQuizResult(result);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Қате",
          description: "Сессия аяқталды. Қайта кіру...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Қате",
        description: "Тест нәтижесін сақтау кезінде қате орын алды",
        variant: "destructive",
      });
    },
  });

  const isLoading = moduleLoading || questionsLoading || authLoading;

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, selectedAnswer: answerIndex };
        return updated;
      }
      return [...prev, { questionId, selectedAnswer: answerIndex }];
    });
  };

  const getSelectedAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.selectedAnswer;
  };

  const handleSubmitQuiz = () => {
    if (!moduleId) return;
    submitQuizMutation.mutate({
      moduleId,
      answers,
    });
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setQuizResult(null);
  };

  const sortedQuestions = questions?.sort((a, b) => a.orderIndex - b.orderIndex);
  const currentQ = sortedQuestions?.[currentQuestion];
  const progressPercent = questions ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestion === (questions?.length || 0) - 1;
  const allQuestionsAnswered = answers.length === questions?.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-50">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-10" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-6 w-full mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!module || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Тест табылмады</h2>
          <p className="text-muted-foreground mb-6">
            Бұл модуль үшін тест әлі дайындалмаған.
          </p>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Басты бетке оралу
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (showResults && quizResult) {
    const scorePercent = Math.round((quizResult.score / quizResult.totalQuestions) * 100);
    const isPassed = quizResult.passed;

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-50">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back-home">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-md">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold hidden sm:inline">Тест нәтижесі</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          <Card className="text-center">
            <CardContent className="p-8 md:p-12">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
                isPassed ? 'bg-chart-2/10' : 'bg-destructive/10'
              }`}>
                {isPassed ? (
                  <Trophy className="h-16 w-16 text-chart-2" />
                ) : (
                  <XCircle className="h-16 w-16 text-destructive" />
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2" data-testid="text-result-title">
                {isPassed ? "Құттықтаймыз!" : "Тағы бір рет көріңіз"}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {isPassed 
                  ? "Сіз тестті сәтті тапсырдыңыз!" 
                  : "Тестті өту үшін кемінде 60% қажет"}
              </p>

              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-2 ${isPassed ? 'text-chart-2' : 'text-destructive'}`} data-testid="text-score-percent">
                    {scorePercent}%
                  </div>
                  <div className="text-muted-foreground">Сіздің баллыңыз</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2" data-testid="text-score-fraction">
                    {quizResult.score}/{quizResult.totalQuestions}
                  </div>
                  <div className="text-muted-foreground">Дұрыс жауаптар</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Сұрақтар бойынша нәтиже:</h3>
                <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                  {sortedQuestions?.map((q, index) => {
                    const userAnswer = answers.find(a => a.questionId === q.id);
                    const isCorrect = userAnswer?.selectedAnswer === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={`w-10 h-10 rounded-md flex items-center justify-center font-medium ${
                          isCorrect 
                            ? 'bg-chart-2/10 text-chart-2' 
                            : 'bg-destructive/10 text-destructive'
                        }`}
                        data-testid={`result-question-${index + 1}`}
                      >
                        {index + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button onClick={handleRetakeQuiz} variant="outline" className="gap-2" data-testid="button-retake-quiz">
                  <RotateCcw className="h-4 w-4" />
                  Қайта тапсыру
                </Button>
                <Link href={`/module/${moduleId}`}>
                  <Button variant="outline" className="gap-2" data-testid="button-review-content">
                    <BookOpen className="h-4 w-4" />
                    Материалды қайта қарау
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="gap-2" data-testid="button-go-home">
                    <Home className="h-4 w-4" />
                    Басты бетке
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/module/${moduleId}`}>
              <Button variant="ghost" size="icon" data-testid="button-back-module">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-md">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold hidden sm:inline">{module.title} — Тест</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Сұрақ {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium" data-testid="text-progress">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {sortedQuestions?.map((q, index) => {
            const isAnswered = answers.some(a => a.questionId === q.id);
            const isCurrent = index === currentQuestion;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : isAnswered 
                      ? 'bg-chart-2/20 text-chart-2' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                data-testid={`button-question-${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {currentQ && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed" data-testid="text-question">
                {currentQ.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = getSelectedAnswer(currentQ.id) === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(currentQ.id, index)}
                      className={`w-full p-4 text-left rounded-md border transition-all hover-elevate ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      data-testid={`button-option-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {isSelected && <CheckCircle className="h-4 w-4 text-primary-foreground" />}
                        </div>
                        <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="gap-2"
                  data-testid="button-prev-question"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Алдыңғы
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered || submitQuizMutation.isPending}
                    className="gap-2"
                    data-testid="button-submit-quiz"
                  >
                    {submitQuizMutation.isPending ? "Тексеруде..." : "Тестті аяқтау"}
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(prev => Math.min((questions?.length || 1) - 1, prev + 1))}
                    className="gap-2"
                    data-testid="button-next-question"
                  >
                    Келесі
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
