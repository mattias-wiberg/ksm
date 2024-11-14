import { MythicScore } from "@/components/mythic-score";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <div className="relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <MythicScore />
      </div>
    </Suspense>
  );
}
