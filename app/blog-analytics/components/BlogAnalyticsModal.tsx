"use client";

import { useState, useEffect } from "react";
import { Blog } from "@/types/blog";
import { supabase } from "@/lib/config/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ThumbsUp, ThumbsDown } from "lucide-react";

interface BlogAnalyticsModalProps {
  blog: Blog;
  onClose: () => void;
}

export default function BlogAnalyticsModal({
  blog,
  onClose,
}: BlogAnalyticsModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    totalLikes: 0,
    totalDislikes: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: analyticsData, error: fetchError } = await supabase
          .from("blog_analytics")
          .select("*")
          .eq("blog_id", blog.id)
          .order("date", { ascending: false });

        if (fetchError) throw fetchError;

        if (analyticsData) {
          setData(analyticsData.reverse());

          // Calculate stats
          const totalVisitors = analyticsData.reduce(
            (sum, item) => sum + (item.visitors || 0),
            0,
          );
          const totalLikes = analyticsData.reduce(
            (sum, item) => sum + (item.likes || 0),
            0,
          );
          const totalDislikes = analyticsData.reduce(
            (sum, item) => sum + (item.dislikes || 0),
            0,
          );

          const todayStr = new Date().toISOString().split("T")[0];
          const todayData = analyticsData.find(
            (item) => item.date === todayStr,
          );

          setStats({
            totalVisitors,
            todayVisitors: todayData?.visitors || 0,
            totalLikes,
            totalDislikes,
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [blog.id]);

  // Filter data based on time range
  const filteredData = (() => {
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
  })();

  const chartData = filteredData.map((item) => ({
    date: item.date,
    visitors: item.visitors || 0,
    likes: item.likes || 0,
    dislikes: item.dislikes || 0,
  }));

  const engagementRate =
    stats.totalLikes + stats.totalDislikes > 0
      ? Math.round(
          (stats.totalLikes / (stats.totalLikes + stats.totalDislikes)) * 100,
        )
      : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] xl:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 dialog-content-animated">
        <DialogHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">{blog.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Comprehensive analytics for this blog post
              </DialogDescription>
            </div>
            {blog.cover_image && (
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No analytics data available yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Visitors */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Visitors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      <div className="text-2xl font-bold">
                        {stats.totalVisitors.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      All-time visitors
                    </p>
                  </CardContent>
                </Card>

                {/* Today's Visitors */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Today's Visitors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-accent" />
                      <div className="text-2xl font-bold">
                        {stats.todayVisitors}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Visitors today
                    </p>
                  </CardContent>
                </Card>

                {/* Total Likes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Likes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                      <div className="text-2xl font-bold">
                        {stats.totalLikes.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Positive feedback
                    </p>
                  </CardContent>
                </Card>

                {/* Total Dislikes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Total Dislikes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5 text-red-600" />
                      <div className="text-2xl font-bold">
                        {stats.totalDislikes.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Negative feedback
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {engagementRate}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Like Rate (Likes / Total Feedback)
                      </p>
                    </div>
                    <div className="bg-linear-to-r from-green-500/10 to-green-500/5 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Engagement Ratio
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        {stats.totalLikes} 👍 vs {stats.totalDislikes} 👎
                      </p>
                    </div>
                    <div className="bg-linear-to-r from-accent/10 to-accent/5 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Total Interactions
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        {(
                          stats.totalLikes + stats.totalDislikes
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Range Filter */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Analytics Over Time</h3>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Visitors, Likes & Dislikes Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No data for selected period
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="fillVisitors"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--chart-1)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--chart-1)"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="fillLikes"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--chart-likes)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--chart-likes)"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="fillDislikes"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--chart-dislikes)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--chart-dislikes)"
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
                          tickFormatter={(value: string) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />

                        <Tooltip
                          cursor={false}
                          content={({ active, payload, label }) => {
                            if (active && payload && label) {
                              return (
                                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                  <p className="text-sm font-semibold text-foreground">
                                    {new Date(label).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )}
                                  </p>
                                  {payload.map((entry: any, index: number) => (
                                    <p
                                      key={index}
                                      className="text-sm"
                                      style={{ color: entry.color }}
                                    >
                                      {entry.name}: {entry.value}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Area
                          dataKey="visitors"
                          type="natural"
                          fill="url(#fillVisitors)"
                          stroke="var(--chart-1)"
                          name="Visitors"
                        />

                        <Area
                          dataKey="likes"
                          type="natural"
                          fill="url(#fillLikes)"
                          stroke="var(--chart-likes)"
                          name="Likes"
                        />

                        <Area
                          dataKey="dislikes"
                          type="natural"
                          fill="url(#fillDislikes)"
                          stroke="var(--chart-dislikes)"
                          name="Dislikes"
                        />

                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                            Date
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                            Visitors
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                            Likes 👍
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                            Dislikes 👎
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                            Engagement
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(-30).map((item, idx) => {
                          const engagement =
                            item.likes + item.dislikes > 0
                              ? Math.round(
                                  (item.likes / (item.likes + item.dislikes)) *
                                    100,
                                )
                              : 0;
                          return (
                            <tr
                              key={idx}
                              className="border-b border-border/50 hover:bg-muted/50 transition-colors table-row-hover"
                            >
                              <td className="py-3 px-4">
                                {new Date(item.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "2-digit",
                                  },
                                )}
                              </td>
                              <td className="text-right py-3 px-4 font-semibold">
                                {item.visitors}
                              </td>
                              <td className="text-right py-3 px-4 text-green-600 font-semibold">
                                {item.likes}
                              </td>
                              <td className="text-right py-3 px-4 text-red-600 font-semibold">
                                {item.dislikes}
                              </td>
                              <td className="text-right py-3 px-4">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                                  {engagement}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
