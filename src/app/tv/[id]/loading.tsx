import { Navbar } from "@/components/Navbar";

export default function TvDetailLoading() {
  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />
      <main className="delayed-loader mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6">
        <div className="mb-6 h-4 w-28 rounded skeleton" />
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
          <div className="mx-auto aspect-[2/3] w-52 shrink-0 rounded-xl skeleton sm:mx-0 sm:w-64" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-36 rounded skeleton" />
            <div className="h-9 w-2/3 rounded skeleton" />
            <div className="h-4 w-48 rounded skeleton" />
            <div className="flex gap-2 pt-3">
              <div className="h-11 w-36 rounded-lg skeleton" />
              <div className="h-11 w-24 rounded-lg skeleton" />
              <div className="h-11 w-24 rounded-lg skeleton" />
            </div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 w-full rounded-xl skeleton" />
          ))}
        </div>
      </main>
    </div>
  );
}
