import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Bell,
  MapPin,
  Calendar,
  AlertTriangle
} from "lucide-react";
import type { HealthAlert, Prescription } from "@shared/schema";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  // Fetch admin statistics
  const { data: stats } = useQuery<{
    totalPrescriptions: number;
    totalAlerts: number;
    totalLearners: number;
    totalDoctors: number;
    diseaseDistribution: Array<{ name: string; value: number }>;
    weeklyTrend: Array<{ date: string; cases: number }>;
    regionalData: Array<{ region: string; cases: number; alerts: number }>;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch all alerts
  const { data: allAlerts } = useQuery<HealthAlert[]>({
    queryKey: ["/api/admin/alerts"],
  });

  // Fetch recent prescriptions
  const { data: recentActivity } = useQuery<Prescription[]>({
    queryKey: ["/api/admin/recent-activity"],
  });

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor health data, alerts, and system performance across all regions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-prescriptions">
              {stats?.totalPrescriptions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="stat-total-alerts">
              {stats?.totalAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-learners">
              {stats?.totalLearners?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Using the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthcare Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-doctors">
              {stats?.totalDoctors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Contributing data
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disease Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Disease Distribution</CardTitle>
            <CardDescription>Breakdown of reported cases by disease</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.diseaseDistribution && stats.diseaseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.diseaseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.diseaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Case Trend</CardTitle>
            <CardDescription>Number of cases reported over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.weeklyTrend && stats.weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Regional Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Overview</CardTitle>
          <CardDescription>Cases and alerts by region</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.regionalData && stats.regionalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" fill="hsl(var(--chart-1))" />
                <Bar dataKey="alerts" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No regional data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Health Alerts
          </CardTitle>
          <CardDescription>Current disease outbreak alerts across regions</CardDescription>
        </CardHeader>
        <CardContent>
          {allAlerts && allAlerts.length > 0 ? (
            <div className="space-y-4">
              {allAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 rounded-md border-l-4"
                  style={{
                    borderLeftColor:
                      alert.severity === "critical"
                        ? "hsl(var(--destructive))"
                        : alert.severity === "high"
                        ? "hsl(var(--chart-4))"
                        : alert.severity === "medium"
                        ? "hsl(var(--chart-3))"
                        : "hsl(var(--chart-1))",
                    backgroundColor: "hsl(var(--muted))",
                  }}
                  data-testid={`admin-alert-${alert.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{alert.disease}</h4>
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {alert.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {alert.caseCount} cases
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(alert.createdAt!), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active alerts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Prescription Submissions</CardTitle>
          <CardDescription>Latest data from healthcare workers</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Disease</th>
                    <th className="pb-3 font-medium">Region</th>
                    <th className="pb-3 font-medium">Age Group</th>
                    <th className="pb-3 font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.slice(0, 20).map((prescription) => (
                    <tr key={prescription.id} className="border-b">
                      <td className="py-3 text-sm">
                        {format(new Date(prescription.createdAt!), "MMM dd, HH:mm")}
                      </td>
                      <td className="py-3 font-medium">{prescription.diagnosis}</td>
                      <td className="py-3 text-sm">{prescription.region}</td>
                      <td className="py-3 text-sm">{prescription.ageGroup}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            prescription.severity === "severe" ? "destructive" : "secondary"
                          }
                        >
                          {prescription.severity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
