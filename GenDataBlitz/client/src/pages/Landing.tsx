import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  Brain, 
  Bell, 
  TrendingUp, 
  Shield,
  Stethoscope,
  GraduationCap,
  Globe
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Rural Health Educators</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="default" data-testid="button-login">
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="h-4 w-4" />
              <span>AI-Powered Health Education</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Empowering Rural Communities with Health Knowledge
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Real-time disease alerts, gamified learning, and AI-powered health education 
              to prevent communicable diseases and save lives in rural areas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" data-testid="button-start-learning">
                <a href="/api/login">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Start Learning
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" data-testid="button-doctor-portal">
                <a href="/api/login">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Doctor Portal
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Lives Educated", value: "50,000+", icon: Users },
              { label: "Alerts Sent", value: "12,500+", icon: Bell },
              { label: "Disease Tracked", value: "25+", icon: Activity },
              { label: "Regions Covered", value: "150+", icon: Globe },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Three Powerful Modules
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed for healthcare workers, learners, and public health monitoring
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Doctor Module */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Doctor Data Collection</CardTitle>
                <CardDescription>
                  Simple prescription data entry for rural healthcare workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Privacy-first: No patient identity collected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Quick entry: Age, gender, and diagnosis only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Real-time alerts for disease outbreaks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Learning Module */}
            <Card className="hover-elevate border-primary/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gamified Learning</CardTitle>
                <CardDescription>
                  Interactive quizzes and educational content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Learn about dengue, malaria, diarrhea & more</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Earn points, badges, and track your progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Compete on leaderboards with your community</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Public Display Module */}
            <Card className="hover-elevate">
              <CardHeader>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Health Alert Broadcasting</CardTitle>
                <CardDescription>
                  AI-generated alerts displayed on public screens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Real-time disease outbreak notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Preventive measures and treatment info</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Seasonal health alerts and reminders</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, three-step process from data collection to community education
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: "01",
                title: "Data Collection",
                description: "Doctors enter anonymous prescription data (age, gender, diagnosis) via mobile app",
                icon: Stethoscope,
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "GPT-5 analyzes patterns, detects outbreaks, and generates contextual health alerts",
                icon: Brain,
              },
              {
                step: "03",
                title: "Community Education",
                description: "Alerts broadcast on public displays, learning modules teach prevention",
                icon: Bell,
              },
            ].map((item, index) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare workers and learners in the fight against preventable diseases
              </p>
              <Button asChild size="lg" data-testid="button-cta-start">
                <a href="/api/login">
                  Get Started Today
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-bold">Rural Health Educators</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering rural communities with accessible health education and real-time disease alerts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/api/login" className="hover:text-foreground transition-colors">Doctor Portal</a></li>
                <li><a href="/api/login" className="hover:text-foreground transition-colors">Learning Modules</a></li>
                <li><a href="/api/login" className="hover:text-foreground transition-colors">Health Alerts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Emergency: 1800-XXX-XXXX</li>
                <li>support@ruralhealth.org</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Rural Health Educators. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
