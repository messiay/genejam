import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, TrendingUp, Users, Activity, Plus, Bell, Calendar } from "lucide-react";
import type { Prescription, HealthAlert } from "@shared/schema";
import { format } from "date-fns";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ageGroup: "",
    gender: "",
    diagnosis: "",
    symptoms: "",
    severity: "moderate",
    region: user?.region || "",
  });

  // Fetch today's statistics
  const { data: stats } = useQuery<{
    todayEntries: number;
    weekEntries: number;
    activeAlerts: number;
    topDiseases: Array<{ disease: string; count: number }>;
  }>({
    queryKey: ["/api/doctor/stats"],
  });

  // Fetch recent prescriptions
  const { data: recentPrescriptions, isLoading: loadingPrescriptions } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions/recent"],
  });

  // Fetch active alerts
  const { data: activeAlerts } = useQuery<HealthAlert[]>({
    queryKey: ["/api/alerts/active"],
  });

  // Submit prescription mutation
  const submitPrescription = useMutation({
    mutationFn: async (data: typeof formData) => {
      const symptomsArray = data.symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      
      await apiRequest("POST", "/api/prescriptions", {
        ...data,
        symptoms: symptomsArray,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prescription data submitted successfully",
      });
      // Reset form
      setFormData({
        ageGroup: "",
        gender: "",
        diagnosis: "",
        symptoms: "",
        severity: "moderate",
        region: user?.region || "",
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ageGroup || !formData.gender || !formData.diagnosis || !formData.region) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    submitPrescription.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
        <p className="text-muted-foreground">
          Submit prescription data to help monitor disease patterns in your region
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-today-entries">
              {stats?.todayEntries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-week-entries">
              {stats?.weekEntries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-active-alerts">
              {stats?.activeAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              In your region
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Disease</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate" data-testid="stat-top-disease">
              {stats?.topDiseases?.[0]?.disease || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.topDiseases?.[0]?.count || 0} cases
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prescription Entry Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Prescription Entry
              </CardTitle>
              <CardDescription>
                Enter anonymous patient data for disease monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group *</Label>
                    <Select
                      value={formData.ageGroup}
                      onValueChange={(value) =>
                        setFormData({ ...formData, ageGroup: value })
                      }
                    >
                      <SelectTrigger id="ageGroup" data-testid="select-age-group">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-5">0-5 years</SelectItem>
                        <SelectItem value="6-12">6-12 years</SelectItem>
                        <SelectItem value="13-18">13-18 years</SelectItem>
                        <SelectItem value="19-40">19-40 years</SelectItem>
                        <SelectItem value="41-60">41-60 years</SelectItem>
                        <SelectItem value="60+">60+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger id="gender" data-testid="select-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    placeholder="e.g., Dengue, Malaria, Diarrhea"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    data-testid="input-diagnosis"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="e.g., fever, headache, body pain"
                    value={formData.symptoms}
                    onChange={(e) =>
                      setFormData({ ...formData, symptoms: e.target.value })
                    }
                    data-testid="input-symptoms"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({ ...formData, severity: value })
                      }
                    >
                      <SelectTrigger id="severity" data-testid="select-severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Input
                      id="region"
                      placeholder="e.g., District name"
                      value={formData.region}
                      onChange={(e) =>
                        setFormData({ ...formData, region: e.target.value })
                      }
                      data-testid="input-region"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitPrescription.isPending}
                  data-testid="button-submit-prescription"
                >
                  {submitPrescription.isPending ? "Submitting..." : "Submit Prescription Data"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Health Alerts
              </CardTitle>
              <CardDescription>Current alerts in your region</CardDescription>
            </CardHeader>
            <CardContent>
              {activeAlerts && activeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {activeAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-md border-l-4 bg-muted/50"
                      style={{
                        borderLeftColor:
                          alert.severity === "critical"
                            ? "hsl(var(--destructive))"
                            : alert.severity === "high"
                            ? "hsl(var(--chart-4))"
                            : alert.severity === "medium"
                            ? "hsl(var(--chart-3))"
                            : "hsl(var(--chart-1))",
                      }}
                      data-testid={`alert-${alert.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold">{alert.disease}</h4>
                        <Badge
                          variant={
                            alert.severity === "critical" || alert.severity === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.caseCount} cases in {alert.region}
                      </p>
                      <p className="text-sm line-clamp-2">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Prescriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Prescription Entries</CardTitle>
          <CardDescription>Your recent submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPrescriptions ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : recentPrescriptions && recentPrescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Diagnosis</th>
                    <th className="pb-3 font-medium">Age Group</th>
                    <th className="pb-3 font-medium">Gender</th>
                    <th className="pb-3 font-medium">Severity</th>
                    <th className="pb-3 font-medium">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrescriptions.slice(0, 10).map((prescription) => (
                    <tr key={prescription.id} className="border-b" data-testid={`prescription-${prescription.id}`}>
                      <td className="py-3 text-sm">
                        {format(new Date(prescription.createdAt!), "MMM dd, yyyy")}
                      </td>
                      <td className="py-3 font-medium">{prescription.diagnosis}</td>
                      <td className="py-3 text-sm">{prescription.ageGroup}</td>
                      <td className="py-3 text-sm capitalize">{prescription.gender}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            prescription.severity === "severe" ? "destructive" : "secondary"
                          }
                        >
                          {prescription.severity}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">{prescription.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No prescriptions submitted yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
