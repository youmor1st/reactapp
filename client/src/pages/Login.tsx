import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GraduationCap, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Кіру сәтті",
        description: "Сіз сәтті жүйеге кірдіңіз",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      const message = error.message.includes("401") 
        ? "Email немесе құпия сөз дұрыс емес"
        : "Кіру кезінде қате орын алды";
      toast({
        title: "Қате",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-md">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Кіру</CardTitle>
          </div>
          <CardDescription>
            Компьютерлік сауаттылық курсына кіру үшін аккаунтыңызды енгізіңіз
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Құпия сөз</Label>
              <Input
                id="password"
                type="password"
                placeholder="Құпия сөзіңізді енгізіңіз"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Кіруде...
                </>
              ) : (
                "Кіру"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Аккаунтыңыз жоқ па? </span>
            <Link href="/register">
              <Button variant="link" className="p-0 h-auto">
                Тіркелу
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

