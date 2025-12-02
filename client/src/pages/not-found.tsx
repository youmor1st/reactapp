import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">404 — Бет табылмады</h1>
          <p className="text-muted-foreground mb-6">
            Сіз іздеген бет жоқ немесе жойылған болуы мүмкін.
          </p>
          <Link href="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Басты бетке оралу
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
