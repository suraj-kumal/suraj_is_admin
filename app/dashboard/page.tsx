"use client";

import { authChecker } from "@/lib/controllers/authChecker";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoadingSpinner } from "@/components/ui/pageLoading";
import Link from "next/link";
import { VisitorsChart } from "@/components/main-area-chart";
import { supabase } from "@/lib/config/supabaseClient";
import { Blog } from "@/types/blog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const isLoggedIn = await authChecker();

      if (!isLoggedIn) {
        router.push("/");
        return;
      }

      // Fetch blogs for stats
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (mounted && data) {
        setBlogs(data);
        setStats({
          total: data.length,
          published: data.filter((b) => b.published).length,
          drafts: data.filter((b) => !b.published).length,
        });
      }

      if (mounted) setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-background">
      {loading ? (
        <div className="w-screen h-screen flex justify-center items-center">
          <PageLoadingSpinner />
        </div>
      ) : (
        <div>
          {/* Header Section */}
          <div className="border-b border-border bg-gradient-to-br from-background to-muted/30 top-16 z-20">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Welcome back! Here's your blog performance overview.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-6 py-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Total Posts Card */}
              <Card className="card-interactive p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Total Posts
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {stats.total}
                </h3>
                <p className="text-sm text-muted-foreground">All blog posts</p>
              </Card>

              {/* Published Posts Card */}
              <Card className="card-interactive p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Published
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {stats.published}
                </h3>
                <p className="text-sm text-muted-foreground">Live posts</p>
              </Card>

              {/* Drafts Card */}
              <Card className="card-interactive p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Drafts
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  {stats.drafts}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Waiting to be published
                </p>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="mb-10">
              <VisitorsChart />
            </div>

            {/* Recent Posts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Recent Posts</h2>
                    <Link href="/manageblogs">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {blogs.length > 0 ? (
                    <div className="space-y-4">
                      {blogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(blog.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <Badge
                            variant={blog.published ? "default" : "secondary"}
                            className="ml-2 flex-shrink-0"
                          >
                            {blog.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No blog posts yet</p>
                      <Link href="/manageblogs">
                        <Button variant="outline" size="sm" className="mt-4">
                          Create First Post
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link href="/manageblogs" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto py-3"
                      >
                        <FileText className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-medium">Manage Blogs</div>
                          <div className="text-xs text-muted-foreground">
                            Create, edit, or delete posts
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link href="/manageblogs" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto py-3"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-medium">View Published</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.published} live posts
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-sm mb-2">Pro Tip</h3>
                  <p className="text-xs text-muted-foreground">
                    Add SEO metadata to your posts to improve search engine
                    visibility.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
