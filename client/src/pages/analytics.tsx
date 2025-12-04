import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Clock, TrendingUp, Users, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import type { CallLog } from "@shared/schema";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface Stats {
  totalCalls: number;
  avgDuration: number;
  totalDuration: number;
  completedCalls: number;
  totalLeads: number;
  leadCaptureRate: number;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Phone;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {trend && (
            <span className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CallsByDayChart({ calls }: { calls: CallLog[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, "EEE"),
      fullDate: date,
    };
  });

  const callsByDay = last7Days.map((day) => {
    const start = startOfDay(day.fullDate);
    const end = endOfDay(day.fullDate);
    const count = calls.filter((call) => {
      const callDate = new Date(call.startedAt);
      return callDate >= start && callDate <= end;
    }).length;
    return { ...day, count };
  });

  const maxCount = Math.max(...callsByDay.map((d) => d.count), 1);

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Calls This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-40">
          {callsByDay.map((day, index) => (
            <motion.div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-1 w-full flex items-end justify-center">
                <motion.div
                  className="w-full max-w-12 bg-primary/20 rounded-t-md relative overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.count / maxCount) * 100}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground">
                    {day.count}
                  </span>
                </motion.div>
              </div>
              <span className="text-xs text-muted-foreground">{day.date}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: calls = [] } = useQuery<CallLog[]>({
    queryKey: ["/api/calls"],
  });

  const completionRate = stats
    ? Math.round((stats.completedCalls / Math.max(stats.totalCalls, 1)) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your call performance and lead generation
        </p>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center p-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-muted-foreground/30 border-t-primary rounded-full"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatCard
                title="Total Calls"
                value={stats?.totalCalls ?? 0}
                icon={Phone}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatCard
                title="Average Duration"
                value={formatDuration(stats?.avgDuration ?? 0)}
                icon={Clock}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatCard
                title="Completion Rate"
                value={`${completionRate}%`}
                subtitle={`${stats?.completedCalls ?? 0} completed`}
                icon={TrendingUp}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatCard
                title="Leads Captured"
                value={stats?.totalLeads ?? 0}
                subtitle={`${stats?.leadCaptureRate ?? 0}% capture rate`}
                icon={Users}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CallsByDayChart calls={calls} />
          </motion.div>
        </>
      )}
    </div>
  );
}
