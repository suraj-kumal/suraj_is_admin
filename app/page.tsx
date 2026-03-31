"use client";
import "./globals.css";
import { ModeToggle } from "@/components/ui/modetoggle";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast, type ExternalToast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import login from "@/lib/controllers/loginController";
import { useRouter } from "next/navigation";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/config/supabaseClient";
type LoginResponse = {
  data: { user: User; session: Session } | null;
  error: string | null;
};
export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const surajEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const toastPosition: ExternalToast = {
    position: "top-center",
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      }
    };

    checkUser();

    // Optional: listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.push("/dashboard");
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const validateEmail = () => {
    if (email !== surajEmail) {
      toast.warning("you are definitely not suraj", toastPosition);
      return false;
    }

    toast.success("Okay you have free time", toastPosition);
    return true;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    const isValid = validateEmail();

    if (!isValid) {
      setLoading(false);
      return;
    }

    const res: LoginResponse = await login(email, password);

    if (res.error) {
      setLoading(false);
      toast.error(res.error, toastPosition);
      return;
    } else {
      setTimeout(() => {
        setLoading(false);
        router.push("/dashboard");
      }, 3000);
    }
  };

  return (
    <div className="m-0 p-0 w-screen h-screen overflow-hidden">
      <nav className="w-full p-4 flex justify-end pb-0">
        <ModeToggle />
      </nav>

      <main className="w-full h-full flex justify-center items-center">
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/50">
          <CardHeader>
            <CardTitle>
              <h2 className="text-center p-4">
                Login but only Suraj is allowed
              </h2>
            </CardTitle>
          </CardHeader>
          <form onSubmit={(event) => handleSubmit(event)}>
            <CardContent>
              <div className="flex flex-col gap-6 pb-10">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vladimirputin@admin.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full">
                {loading ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    logging in
                  </>
                ) : (
                  "login"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
