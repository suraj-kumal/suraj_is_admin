"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import StatsData from "@/lib/controllers/statsController";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
// ✅ chart config
const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function VisitorsChart() {
  const [data, setData] = React.useState<any[]>([]);
  const [timeRange, setTimeRange] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ fetch using your provider
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await StatsData();
        setData(result || []);
      } catch (err: any) {
        setError(err.message || "Failed to load chart data");
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const todaysVisitors = React.useMemo(() => {
    if (!data.length) return 0;

    const todayStr = new Date().toISOString().split("T")[0];

    const todayData = data.find((item) => item.date === todayStr);

    return todayData ? todayData.visitors : 0;
  }, [data]);

  // ✅ filter logic
  const filteredData = React.useMemo(() => {
    if (!data.length) return [];

    if (timeRange === "all") return data;

    const now = new Date();
    const days = timeRange === "30d" ? 30 : 7;

    const start = new Date();
    start.setDate(now.getDate() - days);

    return data.filter((item) => {
      const d = new Date(item.date);
      return d >= start && d <= now;
    });
  }, [data, timeRange]);

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row pb-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-2xl">Visitors Overview</CardTitle>
          <CardDescription>Showing visitors analytics</CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Today's visitors:{" "}
            <span className="font-semibold text-foreground">
              {todaysVisitors.toLocaleString()}
            </span>
          </p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] sm:ml-auto">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {error ? (
          <div className="text-center py-10 text-destructive flex flex-col items-center gap-2">
            <svg
              className="w-10 h-10 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>{error}</div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No data available for this time range</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                }
              />

              <Area
                dataKey="visitors"
                type="natural"
                fill="url(#fillVisitors)"
                stroke="var(--color-visitors)"
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
