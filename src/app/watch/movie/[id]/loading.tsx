import { Loader2 } from "lucide-react";

export default function WatchLoading() {
  return (
    <div className="delayed-loader flex min-h-screen flex-col items-center justify-center gap-3 bg-[#06080c] text-[#8f9bb0]">
      <Loader2 className="h-6 w-6 animate-spin text-[#38bdf8]" />
      <p className="text-sm">Loading player</p>
    </div>
  );
}
