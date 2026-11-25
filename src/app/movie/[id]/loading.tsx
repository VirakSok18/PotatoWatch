import { Navbar } from "@/components/Navbar";

export default function MovieDetailLoading() {
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
            <div className="space-y-2 pt-3">
              <div className="h-3.5 w-full max-w-2xl rounded skeleton" />
              <div className="h-3.5 w-5/6 max-w-2xl rounded skeleton" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
