import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, XCircle, Loader2, Home } from "lucide-react";

export default function VerifyEmail() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const token = new URLSearchParams(window.location.search).get("token");

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("POST", "/api/auth/verify-email", { token });
      return await response.json();
    },
    onSuccess: () => {
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Email расталды",
        description: "Сіздің email сәтті расталды. Енді жүйеге кіре аласыз.",
      });
    },
    onError: (error: Error) => {
      setStatus("error");
      const message = error.message.includes("400")
        ? "Жарамсыз немесе мерзімі өткен токен"
        : "Email растау кезінде қате орын алды";
      toast({
        title: "Қате",
        description: message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Email расталуда...</h1>
              <p className="text-muted-foreground">
                Сіздің email расталуда, күте тұрыңыз
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-2/10 mb-4">
                <CheckCircle className="h-10 w-10 text-chart-2" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Email сәтті расталды!</h1>
              <p className="text-muted-foreground mb-6">
                Сіздің email сәтті расталды. Енді жүйеге кіре аласыз.
              </p>
              <Link href="/login">
                <Button className="gap-2">
                  Кіру бетіне өту
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Растау сәтсіз</h1>
              <p className="text-muted-foreground mb-6">
                {!token
                  ? "Растау токені табылмады"
                  : "Жарамсыз немесе мерзімі өткен токен. Жаңа растау хатын сұраңыз."}
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/">
                  <Button variant="outline" className="gap-2">
                    <Home className="h-4 w-4" />
                    Басты бет
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="gap-2">
                    Кіру
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

