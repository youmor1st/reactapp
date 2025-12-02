import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Monitor, 
  AppWindow, 
  FolderOpen, 
  Globe,
  Trophy,
  CheckCircle,
  Home
} from "lucide-react";
import type { Module, UserProgress } from "@shared/schema";

const iconMap: Record<string, any> = {
  Monitor,
  AppWindow,
  FolderOpen,
  Globe,
};

export default function ModulePage() {
  const [, params] = useRoute("/module/:id");
  const moduleId = params?.id;
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: modules } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const markContentCompletedMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/progress/${moduleId}/content-completed`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
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
      }
    },
  });

  const moduleProgress = progress?.find(p => p.moduleId === moduleId);
  const isContentCompleted = moduleProgress?.contentCompleted;
  const isQuizCompleted = moduleProgress?.quizCompleted;

  const sortedModules = modules?.sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIndex = sortedModules?.findIndex(m => m.id === moduleId) ?? -1;
  const prevModule = currentIndex > 0 ? sortedModules?.[currentIndex - 1] : null;
  const nextModule = currentIndex < (sortedModules?.length || 0) - 1 ? sortedModules?.[currentIndex + 1] : null;

  const Icon = module ? iconMap[module.icon] || Monitor : Monitor;

  const handleMarkComplete = () => {
    markContentCompletedMutation.mutate();
  };

  if (moduleLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-50">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-10" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Модуль табылмады</h2>
          <p className="text-muted-foreground mb-6">
            Сіз іздеген модуль жоқ немесе жойылған.
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-md">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold hidden sm:inline">Компьютерлік сауаттылық</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-4 rounded-md ${isQuizCompleted ? 'bg-chart-2/10' : 'bg-primary/10'}`}>
            <Icon className={`h-10 w-10 ${isQuizCompleted ? 'text-chart-2' : 'text-primary'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold" data-testid="text-module-title">{module.title}</h1>
              {isQuizCompleted && (
                <CheckCircle className="h-6 w-6 text-chart-2" />
              )}
            </div>
            <p className="text-muted-foreground">{module.description}</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {module.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-2xl font-bold mt-8 mb-4 first:mt-0">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                }
                if (line.startsWith('#### ')) {
                  return <h4 key={index} className="text-base font-semibold mt-3 mb-2">{line.slice(5)}</h4>;
                }
                if (line.startsWith('- **')) {
                  const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
                  if (match) {
                    return (
                      <div key={index} className="flex gap-2 my-2 ml-4">
                        <span className="text-primary">•</span>
                        <span><strong>{match[1]}</strong> — {match[2]}</span>
                      </div>
                    );
                  }
                }
                if (line.startsWith('- ')) {
                  return (
                    <div key={index} className="flex gap-2 my-2 ml-4">
                      <span className="text-primary">•</span>
                      <span>{line.slice(2)}</span>
                    </div>
                  );
                }
                if (line.match(/^\d+\. \*\*/)) {
                  const match = line.match(/^(\d+)\. \*\*(.+?)\*\* — (.+)/);
                  if (match) {
                    return (
                      <div key={index} className="flex gap-2 my-2 ml-4">
                        <span className="text-primary font-medium">{match[1]}.</span>
                        <span><strong>{match[2]}</strong> — {match[3]}</span>
                      </div>
                    );
                  }
                }
                if (line.match(/^\d+\. /)) {
                  const match = line.match(/^(\d+)\. (.+)/);
                  if (match) {
                    return (
                      <div key={index} className="flex gap-2 my-2 ml-4">
                        <span className="text-primary font-medium">{match[1]}.</span>
                        <span>{match[2]}</span>
                      </div>
                    );
                  }
                }
                if (line.trim() === '') {
                  return <div key={index} className="h-4" />;
                }
                return <p key={index} className="my-2 leading-relaxed">{line}</p>;
              })}
            </article>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {prevModule && (
              <Link href={`/module/${prevModule.id}`}>
                <Button variant="outline" className="gap-2" data-testid="button-prev-module">
                  <ArrowLeft className="h-4 w-4" />
                  {prevModule.title}
                </Button>
              </Link>
            )}
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {!isContentCompleted && (
              <Button 
                onClick={handleMarkComplete}
                disabled={markContentCompletedMutation.isPending}
                className="gap-2"
                data-testid="button-mark-complete"
              >
                <CheckCircle className="h-4 w-4" />
                {markContentCompletedMutation.isPending ? "Сақталуда..." : "Оқуды аяқтадым"}
              </Button>
            )}
            {(isContentCompleted || isQuizCompleted) && (
              <Link href={`/quiz/${moduleId}`}>
                <Button className="gap-2" variant={isQuizCompleted ? "outline" : "default"} data-testid="button-start-quiz">
                  <Trophy className="h-4 w-4" />
                  {isQuizCompleted ? "Тестті қайта тапсыру" : "Тестті бастау"}
                </Button>
              </Link>
            )}
          </div>

          <div className="flex gap-2">
            {nextModule && (
              <Link href={`/module/${nextModule.id}`}>
                <Button variant="outline" className="gap-2" data-testid="button-next-module">
                  {nextModule.title}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
