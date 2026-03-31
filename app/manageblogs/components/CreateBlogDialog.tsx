"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/config/supabaseClient";
import slugify from "slugify";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "./RichTextEditor";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Zod validation schema
const createBlogSchema = z.object({
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
  onSuccess: () => void;
}

export default function CreateBlogDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywordsInput, setSeoKeywordsInput] = useState("");

  const editorRef = useRef<{ getHTML: () => string }>(null);

  // Auto slug generation
  useEffect(() => {
    if (title) {
      const generatedSlug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
        replacement: "-",
      });
      setSlug(generatedSlug);
    } else {
      setSlug("");
    }
  }, [title]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setCoverImage("");
    setPublished(false);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywordsInput("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validationResult = createBlogSchema.safeParse({
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
    const toastId = toast.loading("Creating blog post...");

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

      const { error } = await supabase.from("blogs").insert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        cover_image: coverImage || null,
        published,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywordsArray.length > 0 ? seoKeywordsArray : null,
      });

      if (error) throw error;

      toast.dismiss(toastId);
      toast.success("Blog post created successfully!");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(
        "Failed to create blog: " + (error.message || "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Blog
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] max-h-[95vh] overflow-hidden flex flex-col p-0 dialog-content-animated">
        <DialogHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <DialogTitle className="text-2xl">Create New Blog Post</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new blog post
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
                  placeholder="My Awesome Blog Post"
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
                  placeholder="my-awesome-blog-post"
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.slug}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from title (you can edit)
                </p>
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
              <RichTextEditor ref={editorRef} />
              <p className="text-xs text-muted-foreground mt-2">
                Add rich content with formatting, code blocks, and images
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
                {loading ? "Creating..." : "Create Blog Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setOpen(false)}
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
