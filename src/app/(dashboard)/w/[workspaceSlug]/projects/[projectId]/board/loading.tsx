import { InlineLoader } from "@/components/ui/loading-animation"

export default function BoardLoading() {
  return <div className="h-screen flex items-center justify-center"><InlineLoader className="h-8 w-8" /></div>
}
