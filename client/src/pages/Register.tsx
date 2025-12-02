import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Loader2 } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Тіркелу сәтті",
        description: "Растау хатын тексеріңіз. Email-діңізге жіберілген сілтемені басыңыз.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      let message = "Тіркелу кезінде қате орын алды";
      if (error.message.includes("400")) {
        if (error.message.includes("тіркелген")) {
          message = "Бұл email бойынша тіркелген пайдаланушы бар";
        } else {
          message = "Деректер дұрыс емес";
        }
      }
      toast({
        title: "Қате",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-md">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Тіркелу</CardTitle>
          </div>
          <CardDescription>
            Компьютерлік сауаттылық курсына тіркелу үшін деректерді толтырыңыз
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Аты</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Атыңыз"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Тегі</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Тегіңіз"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange("email")}
                required
                disabled={registerMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Құпия сөз</Label>
              <Input
                id="password"
                type="password"
                placeholder="Кемінде 8 таңба"
                value={formData.password}
                onChange={handleChange("password")}
                required
                minLength={8}
                disabled={registerMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Құпия сөз кемінде 8 таңбадан тұруы керек
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Тіркелуде...
                </>
              ) : (
                "Тіркелу"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Алдыңнан тіркелгенсіз бе? </span>
            <Link href="/login">
              <Button variant="link" className="p-0 h-auto">
                Кіру
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

