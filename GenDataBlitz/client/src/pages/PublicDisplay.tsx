import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Activity, Shield, Droplets, Wind, Sun } from "lucide-react";
import type { HealthAlert } from "@shared/schema";
import { format } from "date-fns";

export default function PublicDisplay() {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  // Fetch active health alerts
  const { data: alerts } = useQuery<HealthAlert[]>({
    queryKey: ["/api/alerts/active"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Rotate alerts every 15 seconds
  useEffect(() => {
    if (!alerts || alerts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [alerts]);

  const currentAlert = alerts?.[currentAlertIndex];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "hsl(var(--destructive))";
      case "high":
        return "hsl(var(--chart-4))";
      case "medium":
        return "hsl(var(--chart-3))";
      default:
        return "hsl(var(--chart-1))";
    }
  };

  const getSeasonIcon = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) return <Droplets className="h-8 w-8" />;
    if (month >= 10 || month <= 1) return <Wind className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold">Rural Health Alert System</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            {format(new Date(), "EEEE, MMMM dd, yyyy • HH:mm")}
          </p>
        </div>

        {/* Main Alert Display */}
        {currentAlert ? (
          <Card
            className="border-l-8 transition-all duration-500"
            style={{ borderLeftColor: getSeverityColor(currentAlert.severity) }}
          >
            <CardContent className="p-12">
              <div className="space-y-6">
                {/* Alert Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-20 w-20 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: getSeverityColor(currentAlert.severity),
                        opacity: 0.1,
                      }}
                    >
                      <AlertCircle
                        className="h-10 w-10"
                        style={{ color: getSeverityColor(currentAlert.severity) }}
                      />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold mb-2">{currentAlert.disease} Alert</h2>
                      <div className="flex items-center gap-3">
                        <Badge
                          className="text-lg px-4 py-1"
                          style={{
                            backgroundColor: getSeverityColor(currentAlert.severity),
                            color: "white",
                          }}
                        >
                          {currentAlert.severity.toUpperCase()} SEVERITY
                        </Badge>
                        <span className="text-xl text-muted-foreground">
                          {currentAlert.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">{currentAlert.caseCount}</div>
                    <div className="text-lg text-muted-foreground">Cases Reported</div>
                  </div>
                </div>

                {/* Alert Message */}
                <div className="bg-muted/50 p-6 rounded-md">
                  <p className="text-2xl leading-relaxed">{currentAlert.message}</p>
                </div>

                {/* Symptoms */}
                {currentAlert.symptoms && currentAlert.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-6 w-6 text-primary" />
                      Common Symptoms
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentAlert.symptoms.map((symptom, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 rounded-md bg-muted"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-lg">{symptom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preventive Measures */}
                {currentAlert.preventiveMeasures && currentAlert.preventiveMeasures.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      Prevention & Protection
                    </h3>
                    <div className="grid gap-3">
                      {currentAlert.preventiveMeasures.map((measure, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-md bg-primary/10"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <span className="text-lg pt-1">{measure}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-3xl font-bold mb-2">No Active Alerts</h2>
              <p className="text-xl text-muted-foreground">
                Your community is safe. Stay healthy!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bottom Ticker */}
        <div className="bg-primary text-primary-foreground p-6 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getSeasonIcon()}
              <div>
                <div className="text-sm opacity-90">Health Tip</div>
                <div className="text-xl font-semibold">
                  Wash hands regularly • Drink clean water • Maintain hygiene
                </div>
              </div>
            </div>
            {alerts && alerts.length > 1 && (
              <div className="text-sm opacity-90">
                Alert {currentAlertIndex + 1} of {alerts.length}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="text-center p-6 bg-muted/30 rounded-md">
          <p className="text-2xl font-semibold mb-2">Emergency Health Helpline</p>
          <p className="text-4xl font-bold text-primary">1800-XXX-XXXX</p>
          <p className="text-lg text-muted-foreground mt-2">Available 24/7</p>
        </div>
      </div>
    </div>
  );
}
