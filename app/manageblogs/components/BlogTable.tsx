"use client";

import { useState, useMemo } from "react";
import { Blog } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Search } from "lucide-react";
import EditBlogDialog from "./EditBlogDialog";
import { supabase } from "@/lib/config/supabaseClient";
import { toast } from "sonner";

interface Props {
  blogs: Blog[];
  loading: boolean;
  onRefresh: () => void;
}

export default function BlogTable({ blogs, loading, onRefresh }: Props) {
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date");

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    let filtered = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return (b.published ? 1 : 0) - (a.published ? 1 : 0);
        case "date":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [blogs, searchTerm, sortBy]);

  const handleDelete = async (id: string, title: string) => {
    toast.loading("Deleting blog...");

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;

      toast.dismiss();
      toast.success(`Blog "${title}" deleted successfully`);
      onRefresh();
    } catch (error: any) {
      toast.dismiss();
      toast.error("Failed to delete blog: " + error.message);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <p className="text-muted-foreground">Loading blogs...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Slug</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Cover</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlogs.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 opacity-30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="font-medium">No blogs found</p>
                    <p className="text-sm">
                      Create your first blog post to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id} className="table-row-hover">
                  <TableCell className="font-medium max-w-xs truncate">
                    {blog.title}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {blog.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={blog.published ? "default" : "secondary"}
                      className="animate-fadeIn"
                    >
                      {blog.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.cover_image ? (
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-12 h-12 object-cover rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(blog.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBlog(blog)}
                        className="hover:bg-primary/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(blog.id, blog.title)}
                        className="hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingBlog && (
        <EditBlogDialog
          blog={editingBlog}
          open={true}
          onOpenChange={() => setEditingBlog(null)}
          onSuccess={onRefresh}
        />
      )}
    </Card>
  );
}
