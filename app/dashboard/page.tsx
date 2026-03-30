"use client";

import { authChecker } from "@/lib/controllers/authChecker";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoadingSpinner } from "@/components/ui/pageLoading";
import Link from "next/link";
import { VisitorsChart } from "@/components/main-area-chart";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const isLoggedIn = await authChecker();

      if (!isLoggedIn) {
        router.push("/");
        return;
      }

      if (mounted) setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main>
      {loading ? (
        <div className="w-screen h-screen flex justify-center items-center">
          <PageLoadingSpinner />
        </div>
      ) : (
        <div>
          <h1 className="text-center text-xl pb-5 pt-5">Portfolio Analytics</h1>
          <VisitorsChart />
        </div>
      )}

      <Link href="/manageblogs">manage blogs</Link>
    </main>
  );
}
