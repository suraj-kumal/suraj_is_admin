"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/config/supabaseClient";
import { Blog } from "@/types/blog";
import BlogTable from "./components/BlogTable";
import CreateBlogDialog from "./components/CreateBlogDialog";
import { BarChart3 } from "lucide-react";

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs:", error);
    } else {
      setBlogs(data || []);
      const published = (data || []).filter((b) => b.published).length;
      const draft = (data || []).filter((b) => !b.published).length;
      setPublishedCount(published);
      setDraftCount(draft);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const refreshBlogs = () => fetchBlogs();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto py-10 px-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Manage Blogs
                </h1>
              </div>
              <p className="text-muted-foreground">
                Create, edit and manage your blog posts with ease
              </p>

              {/* Quick Stats */}
              <div className="flex gap-6 mt-6">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Total Posts
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {blogs.length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Published
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {publishedCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Drafts</span>
                  <span className="text-2xl font-bold text-secondary">
                    {draftCount}
                  </span>
                </div>
              </div>
            </div>

            <CreateBlogDialog onSuccess={refreshBlogs} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="container mx-auto py-10 px-6">
        <BlogTable blogs={blogs} loading={loading} onRefresh={refreshBlogs} />
      </div>
    </div>
  );
}
