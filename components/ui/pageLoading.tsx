import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("w-6 h-6 animate-spin text-primary", className)}
      {...props}
    />
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-4">
      <Spinner />
    </div>
  );
}
