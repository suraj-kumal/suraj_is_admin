"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/config/supabaseClient";
import { Blog } from "@/types/blog";
import BlogAnalyticsCard from "./components/BlogAnalyticsCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, TrendingUp } from "lucide-react";

export default function BlogAnalyticsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("blogs")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          setBlogs(data as Blog[]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((blog) =>
        filterStatus === "published" ? blog.published : !blog.published,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, filterStatus]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30">
      {/* Header Section */}
      <div className="border-b border-border bg-linear-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary animate-fadeIn" />
              <h1 className="text-3xl md:text-4xl font-bold animate-fadeIn">
                Blog Analytics
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Monitor performance and engagement for each blog post
            </p>
          </div>

          {/* Stats Summary */}
          {blogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-card border border-border rounded-lg p-4 card-interactive">
                <p className="text-sm text-muted-foreground">Total Blogs</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {blogs.length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 card-interactive">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {blogs.filter((b) => b.published).length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 card-interactive">
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {blogs.filter((b) => !b.published).length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 bg-card border border-border rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">
              No blogs available yet
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slideUp">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search blogs by title or excerpt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-interactive"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-45 input-interactive">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blogs</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredBlogs.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {blogs.length}
                </span>{" "}
                blogs
              </p>
            </div>

            {/* Analytics Grid */}
            {filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} className="animate-slideUp">
                    <BlogAnalyticsCard blog={blog} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No blogs match your search criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
