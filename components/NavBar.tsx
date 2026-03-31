"use client";
import { ModeToggle } from "./ui/modetoggle";
import { Button } from "./ui/button";
import { LogOut, Menu, X, ChevronRight, Settings, User } from "lucide-react";
import { supabase } from "@/lib/config/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const hasShown = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!hasShown.current) {
      toast.success("Welcome back", { position: "top-center" });
      hasShown.current = true;
    }

    // Get user email
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "User");
      }
    };
    getUser();
  }, []);

  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((p) => p);
    if (!paths.length) return [];

    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label =
        path === "dashboard"
          ? "Dashboard"
          : path === "manageblogs"
            ? "Manage Blogs"
            : path === "blog-analytics"
              ? "Blog Analytics"
              : path.charAt(0).toUpperCase() + path.slice(1);
      return { label, href };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="w-full border-b border-border bg-background animate-fadeIn">
      {/* Desktop NavBar */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* Left: Logo & Branding */}
        {/* <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
            Suraj Is Admin
          </div>
          <span className="text-xl font-bold hidden sm:inline">BlogHub</span>
        </Link> */}

        {/* Center: Breadcrumbs & Navigation */}
        <div className="flex items-center gap-4 flex-1 ml-8">
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <ModeToggle />

          {/* User Menu Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">
                {userEmail.split("@")[0]}
              </span>
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-fit bg-card border border-border rounded-lg shadow-lg p-2 z-50 animate-slideDown">
                <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border mb-2">
                  {userEmail}
                </div>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm gap-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-4m0 0l7-4 7 4M5 8v10a1 1 0 001 1h2a1 1 0 001-1v-5a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 001 1h2a1 1 0 001-1V8m0 0l2-4m2 4v10a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5a1 1 0 00-1-1H9a1 1 0 00-1 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8m14 4l2-4"
                      />
                    </svg>
                    Dashboard
                  </Button>
                </Link>
                <Link href="/manageblogs">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm gap-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                      />
                    </svg>
                    Manage Blogs
                  </Button>
                </Link>
                <Link href="/blog-analytics">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm gap-2"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6M3 17v4a1 1 0 001 1h16a1 1 0 001-1v-4"
                      />
                    </svg>
                    Blog Analytics
                  </Button>
                </Link>
                <div className="border-t border-border my-2"></div>
                {/* <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button> */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile NavBar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            B
          </div>
          <span className="text-lg font-bold">BlogHub</span>
        </Link>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slideDown p-4 space-y-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/manageblogs">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Manage Blogs
            </Button>
          </Link>
          <Link href="/blog-analytics">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog Analytics
            </Button>
          </Link>
          <div className="border-t border-border my-2"></div>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            {userEmail}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
