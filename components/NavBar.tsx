"use client";
import { ModeToggle } from "./ui/modetoggle";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/config/supabaseClient";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { toast } from "sonner";
const NavBar = () => {
  const router = useRouter();

  const hasShown = useRef(false);

  useEffect(() => {
    if (!hasShown.current) {
      toast.success("welcome back", { position: "top-center" });
      hasShown.current = true;
    }
  }, []);
  return (
    <nav className="w-full p-4 flex justify-end pb-0 gap-3">
      <ModeToggle />
      <div className="p-0">
        <Button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
        >
          <LogOut />
        </Button>
      </div>
    </nav>
  );
};

export default NavBar;
