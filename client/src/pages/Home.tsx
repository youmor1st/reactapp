import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { 
  GraduationCap, 
  Monitor, 
  AppWindow, 
  FolderOpen, 
  Globe, 
  CheckCircle,
  PlayCircle,
  Trophy,
  BookOpen,
  LogOut
} from "lucide-react";
import type { Module, UserProgress, QuizResult } from "@shared/schema";

const iconMap: Record<string, any> = {
  Monitor,
  AppWindow,
  FolderOpen,
  Globe,
};

export default function Home() {
  const { user } = useAuth();

  const { data: modules, isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const { data: results, isLoading: resultsLoading } = useQuery<QuizResult[]>({
    queryKey: ["/api/results"],
  });

  const isLoading = modulesLoading || progressLoading || resultsLoading;

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress?.find(p => p.moduleId === moduleId);
    return moduleProgress;
  };

  const getModuleBestScore = (moduleId: string) => {
    const moduleResults = results?.filter(r => r.moduleId === moduleId);
    if (!moduleResults || moduleResults.length === 0) return null;
    return Math.max(...moduleResults.map(r => Math.round((r.score / r.totalQuestions) * 100)));
  };

  const completedModules = progress?.filter(p => p.quizCompleted).length || 0;
  const totalModules = modules?.length || 4;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  const averageScore = results && results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length)
    : 0;

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Қолданушы";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-md">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline">Компьютерлік сауаттылық</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
                {getUserName()}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              data-testid="button-logout"
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                  queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                  window.location.href = "/";
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Сәлем, {getUserName()}! 👋
                  </h1>
                  <p className="text-muted-foreground">
                    Компьютерлік сауаттылық курсына қош келдіңіз. Оқуды жалғастырыңыз!
                  </p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <div className="text-center p-4 bg-background rounded-md min-w-[100px]">
                    <div className="text-3xl font-bold text-primary" data-testid="text-progress-percent">
                      {overallProgress}%
                    </div>
                    <div className="text-sm text-muted-foreground">Прогресс</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-md min-w-[100px]">
                    <div className="text-3xl font-bold text-chart-2" data-testid="text-completed-count">
                      {completedModules}/{totalModules}
                    </div>
                    <div className="text-sm text-muted-foreground">Модуль</div>
                  </div>
                  {averageScore > 0 && (
                    <div className="text-center p-4 bg-background rounded-md min-w-[100px]">
                      <div className="text-3xl font-bold text-chart-4" data-testid="text-average-score">
                        {averageScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Орташа балл</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Оқу модульдері</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules?.sort((a, b) => a.orderIndex - b.orderIndex).map((module) => {
                const moduleProgress = getModuleProgress(module.id);
                const bestScore = getModuleBestScore(module.id);
                const Icon = iconMap[module.icon] || Monitor;
                const isCompleted = moduleProgress?.quizCompleted;
                const isStarted = moduleProgress?.contentCompleted || bestScore !== null;

                return (
                  <Card 
                    key={module.id} 
                    className={`hover-elevate transition-all ${isCompleted ? 'border-chart-2/30' : ''}`}
                    data-testid={`card-module-${module.id}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-md ${isCompleted ? 'bg-chart-2/10' : 'bg-primary/10'}`}>
                          <Icon className={`h-8 w-8 ${isCompleted ? 'text-chart-2' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-xl">{module.title}</CardTitle>
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-chart-2" />
                            )}
                          </div>
                          <CardDescription className="text-base line-clamp-2">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(isStarted || isCompleted) && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Прогресс</span>
                              {bestScore !== null && (
                                <span className="font-medium flex items-center gap-1">
                                  <Trophy className="h-4 w-4 text-chart-4" />
                                  {bestScore}%
                                </span>
                              )}
                            </div>
                            <Progress 
                              value={isCompleted ? 100 : (moduleProgress?.contentCompleted ? 50 : 0)} 
                              className="h-2"
                            />
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Link href={`/module/${module.id}`}>
                            <Button 
                              className="gap-2"
                              variant={isCompleted ? "outline" : "default"}
                              data-testid={`button-module-${module.id}`}
                            >
                              {isCompleted ? (
                                <>
                                  <BookOpen className="h-4 w-4" />
                                  Қайта қарау
                                </>
                              ) : isStarted ? (
                                <>
                                  <PlayCircle className="h-4 w-4" />
                                  Жалғастыру
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4" />
                                  Бастау
                                </>
                              )}
                            </Button>
                          </Link>
                          {moduleProgress?.contentCompleted && !isCompleted && (
                            <Link href={`/quiz/${module.id}`}>
                              <Button variant="secondary" className="gap-2" data-testid={`button-quiz-${module.id}`}>
                                <Trophy className="h-4 w-4" />
                                Тестті бастау
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
