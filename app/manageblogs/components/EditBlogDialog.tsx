"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/config/supabaseClient";
import { Blog } from "@/types/blog";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "./RichTextEditor";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Zod validation schema (same as Create, but excerpt not required)
const editBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be less than 150 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(300, "Excerpt must be less than 300 characters")
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .optional()
    .or(z.literal("")),
  seoTitle: z
    .string()
    .max(60, "SEO Title must be less than 60 characters")
    .optional()
    .or(z.literal("")),
  seoDescription: z
    .string()
    .min(120, "SEO Description must be at least 120 characters")
    .max(160, "SEO Description must be less than 160 characters")
    .optional()
    .or(z.literal("")),
});

interface Props {
  blog: Blog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditBlogDialog({
  blog,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState(blog.title);
  const [slug, setSlug] = useState(blog.slug);
  const [excerpt, setExcerpt] = useState(blog.excerpt || "");
  const [coverImage, setCoverImage] = useState(blog.cover_image || "");
  const [published, setPublished] = useState(blog.published);
  const [seoTitle, setSeoTitle] = useState(blog.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(
    blog.seo_description || "",
  );
  const [seoKeywordsInput, setSeoKeywordsInput] = useState(
    Array.isArray(blog.seo_keywords)
      ? blog.seo_keywords.join(", ")
      : blog.seo_keywords || "",
  );

  const editorRef = useRef<{
    getHTML: () => string;
    setContent: (html: string) => void;
  }>(null);

  // Load content when dialog opens
  useEffect(() => {
    if (open && editorRef.current) {
      editorRef.current.setContent(blog.content);
    }
  }, [open, blog.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validationResult = editBlogSchema.safeParse({
      title,
      slug,
      excerpt,
      coverImage,
      seoTitle,
      seoDescription,
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0]] = error.message;
        }
      });
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating blog post...");

    try {
      const content = editorRef.current?.getHTML() || "";

      if (!content.trim()) {
        toast.dismiss(toastId);
        toast.error("Please add some content to your blog post");
        setLoading(false);
        return;
      }

      const seoKeywordsArray = seoKeywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const { error } = await supabase
        .from("blogs")
        .update({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          cover_image: coverImage || null,
          published,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          seo_keywords: seoKeywordsArray.length > 0 ? seoKeywordsArray : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", blog.id);

      if (error) throw error;

      toast.dismiss(toastId);
      toast.success("Blog post updated successfully!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(
        "Failed to update blog: " + (error.message || "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] max-h-[95vh] overflow-hidden flex flex-col p-0 dialog-content-animated">
        <DialogHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <DialogTitle className="text-2xl">Edit Blog Post</DialogTitle>
          <DialogDescription>
            Update the details of your blog post below
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="pb-2">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="slug" className="pb-2">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.slug}
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt" className="pb-2">
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary of your blog post (10-300 characters)..."
                rows={3}
                className={errors.excerpt ? "border-destructive" : ""}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {excerpt.length} characters
                </p>
                {errors.excerpt && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.excerpt}
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <Label htmlFor="cover" className="pb-2">
                Cover Image URL
              </Label>
              <Input
                id="cover"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={errors.coverImage ? "border-destructive" : ""}
              />
              {errors.coverImage && (
                <div className="flex items-center gap-2 mt-1 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.coverImage}
                </div>
              )}
              {coverImage && (
                <div className="mt-3 rounded-lg overflow-hidden max-h-40 border border-border">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrors((prev) => ({
                        ...prev,
                        coverImage: "Failed to load image",
                      }));
                    }}
                  />
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border border-border">
              <div>
                <Label className="text-base font-medium">Status</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {published ? "Published" : "Draft"}
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>

            {/* Rich Text Editor */}
            <div>
              <Label className="pb-3 block">
                Content <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor ref={editorRef} initialContent={blog.content} />
              <p className="text-xs text-muted-foreground mt-2">
                Edit your blog content with formatting, code blocks, and images
              </p>
            </div>

            {/* SEO Section */}
            <div className="pt-6 border-t space-y-4">
              <h3 className="font-semibold text-lg">SEO Settings</h3>

              <div>
                <Label htmlFor="seoTitle" className="pb-2">
                  SEO Title
                </Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Optimized title for search engines"
                  className={errors.seoTitle ? "border-destructive" : ""}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {seoTitle.length}/60 characters
                  </p>
                  {errors.seoTitle && (
                    <div className="text-sm text-destructive">
                      {errors.seoTitle}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="seoDescription" className="pb-2">
                  SEO Description
                </Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search results (120-160 characters)..."
                  rows={2}
                  className={errors.seoDescription ? "border-destructive" : ""}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {seoDescription.length}/160 characters
                  </p>
                  {errors.seoDescription && (
                    <div className="text-sm text-destructive">
                      {errors.seoDescription}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="keywords" className="pb-2">
                  SEO Keywords
                </Label>
                <Input
                  id="keywords"
                  value={seoKeywordsInput}
                  onChange={(e) => setSeoKeywordsInput(e.target.value)}
                  placeholder="nextjs, react, typescript, tailwind (comma-separated)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter keywords separated by commas
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                className="flex-1"
                size="lg"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Blog Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
