import { Navbar } from "@/components/Navbar";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />
      <main className="delayed-loader mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full skeleton" />
          ))}
        </div>
        <div className="mb-4 h-5 w-32 rounded skeleton" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-[2/3] w-full rounded-lg skeleton" />
              <div className="h-4 w-4/5 rounded skeleton" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
