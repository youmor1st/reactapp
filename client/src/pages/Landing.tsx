import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { Monitor, AppWindow, FolderOpen, Globe, GraduationCap, BookOpen, CheckCircle, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Құрылғылар және негіздер",
    description: "Компьютердің негізгі құрамдас бөліктері туралы білім алыңыз",
  },
  {
    icon: AppWindow,
    title: "Бағдарламалармен жұмыс",
    description: "Операциялық жүйелер мен қолданбаларды меңгеріңіз",
  },
  {
    icon: FolderOpen,
    title: "Файлдармен жұмыс",
    description: "Файлдар мен қалталарды ұйымдастыруды үйреніңіз",
  },
  {
    icon: Globe,
    title: "Интернет-браузерлер",
    description: "Интернетті қауіпсіз пайдалануды меңгеріңіз",
  },
];

const benefits = [
  "Интерактивті оқу материалдары",
  "Әр тақырып бойынша тест",
  "Прогресті бақылау мүмкіндігі",
  "Қазақ тілінде толық мазмұн",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-md">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline">Компьютерлік сауаттылық</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <Link href="/login">Кіру</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Компьютер негіздерін <br className="hidden md:block" />
              <span className="text-primary">оңай үйреніңіз</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Компьютерлік сауаттылық курсы — құрылғылар, бағдарламалар, файлдар 
              және интернет туралы білім алыңыз. Тестпен білімді бекітіңіз.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-start-learning">
                <Link href="/register" className="gap-2">
                  Оқуды бастау
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 md:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold mb-4">Оқу модульдері</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Төрт модуль арқылы компьютер негіздерін толық меңгеріңіз
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate">
                  <CardHeader className="pb-4">
                    <div className="p-3 bg-primary/10 rounded-md w-fit mb-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-semibold mb-6">
                  Неліктен біздің курсты таңдау керек?
                </h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-chart-2 flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <Card className="p-8 bg-card">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-2">4 модуль</h3>
                    <p className="text-muted-foreground mb-4">Әр модульде тест бар</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md">
                        Тегін
                      </span>
                      <span className="px-3 py-1 bg-chart-2/10 text-chart-2 text-sm rounded-md">
                        Қазақша
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 md:px-8 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-4">Бүгін бастаңыз!</h2>
            <p className="text-lg opacity-90 mb-8">
              Тіркеліп, компьютер негіздерін үйренуді дәл қазір бастаңыз
            </p>
            <Button size="lg" variant="secondary" asChild data-testid="button-register">
              <Link href="/register" className="gap-2">
                Тегін тіркелу
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 md:px-8 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Компьютерлік сауаттылық. Барлық құқықтар қорғалған.</p>
        </div>
      </footer>
    </div>
  );
}
