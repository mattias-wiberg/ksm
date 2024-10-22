import { MythicScore } from "@/components/mythic-score"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

export default function Page() {
  return <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }
  >
    <MythicScore />
  </Suspense>
}