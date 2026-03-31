"use client";

import { useState, useEffect } from "react";
import { Blog } from "@/types/blog";
import { supabase } from "@/lib/config/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import BlogAnalyticsModal from "./BlogAnalyticsModal";

interface BlogAnalyticsCardProps {
  blog: Blog;
}

export default function BlogAnalyticsCard({ blog }: BlogAnalyticsCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    totalLikes: 0,
    totalDislikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_analytics")
          .select("*")
          .eq("blog_id", blog.id);

        if (error) throw error;

        if (data) {
          const totalVisitors = data.reduce(
            (sum, item) => sum + (item.visitors || 0),
            0,
          );
          const totalLikes = data.reduce(
            (sum, item) => sum + (item.likes || 0),
            0,
          );
          const totalDislikes = data.reduce(
            (sum, item) => sum + (item.dislikes || 0),
            0,
          );

          const todayStr = new Date().toISOString().split("T")[0];
          const todayData = data.find((item) => item.date === todayStr);

          setAnalytics({
            totalVisitors,
            todayVisitors: todayData?.visitors || 0,
            totalLikes,
            totalDislikes,
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [blog.id]);

  const engagementRate =
    analytics.totalLikes + analytics.totalDislikes > 0
      ? Math.round(
          (analytics.totalLikes /
            (analytics.totalLikes + analytics.totalDislikes)) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <Card className="overflow-hidden h-full">
        <div className="w-full h-48 bg-linear-to-br from-muted-foreground/10 to-muted-foreground/5 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted-foreground/10 rounded animate-pulse w-full" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-muted-foreground/10 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-interactive overflow-hidden cursor-pointer hover:shadow-lg transition-all h-full flex flex-col">
        {/* Cover Image with Stats Overlay */}
        <div className="relative group h-48 overflow-hidden bg-linear-to-br from-primary/10 to-secondary/10">
          {blog.cover_image ? (
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Stats Badge Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="space-y-2">
              {/* Visitors */}
              <div className="flex items-center gap-2 text-white text-sm">
                <Eye className="w-4 h-4" />
                <span>
                  <strong>{analytics.totalVisitors.toLocaleString()}</strong>{" "}
                  total visitors
                </span>
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-white text-sm">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                  <span className="font-semibold">
                    {analytics.totalLikes.toLocaleString()}
                  </span>
                </div>
                <span className="text-white/60 text-xs">•</span>
                <div className="flex items-center gap-1 text-white text-sm">
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                  <span className="font-semibold">
                    {analytics.totalDislikes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant={blog.published ? "default" : "secondary"}
              className="animate-fadeIn"
            >
              {blog.published ? "Published" : "Draft"}
            </Badge>
          </div>

          {/* Today's Visitors Badge */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {analytics.todayVisitors} today
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate mb-2">
            {blog.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {blog.excerpt || "No description available"}
          </p>

          {/* Analytics Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-primary/10 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Engagement</div>
              <div className="font-bold text-sm text-primary">
                {engagementRate}%
              </div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Likes</div>
              <div className="font-bold text-sm text-green-600">
                {analytics.totalLikes}
              </div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Dislikes</div>
              <div className="font-bold text-sm text-red-600">
                {analytics.totalDislikes}
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <Button
            onClick={() => setShowModal(true)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            View Detailed Analytics
          </Button>
        </div>
      </Card>

      {/* Modal for Detailed Analytics */}
      {showModal && (
        <BlogAnalyticsModal blog={blog} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
