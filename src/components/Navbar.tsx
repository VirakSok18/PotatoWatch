"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Button, Glass, SearchField, TabBar } from "glisse";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { MediaItem } from "@/lib/types";

interface NavbarProps {
  initialQuery?: string;
}

const NAV_TABS = [
  { value: "browse", label: "Browse", href: "/" },
  { value: "library", label: "Library", href: "/library" },
];

export function Navbar({ initialQuery = "" }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab =
    pathname === "/library" ? "library" : pathname === "/" ? "browse" : null;

  const [query, setQuery] = useState(initialQuery);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(Boolean(initialQuery));
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 28);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as { items?: MediaItem[] };
          const list = data.items || [];
          setSuggestions(list);
          list.slice(0, 3).forEach((item) => {
            router.prefetch(`/${item.mediaType}/${item.id}`);
          });
        }
      } catch {
        // Ignore aborted requests
      } finally {
        setSearching(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, router]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    setDropdownOpen(false);
    if (!trimmed) {
      router.push("/");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function renderDropdown() {
    if (!dropdownOpen || query.trim().length < 2) return null;

    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2">
        <Glass className="w-full overflow-hidden rounded-2xl shadow-2xl">
          {searching && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-[#9393a0]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#38bdf8]" />
              <span>Searching</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[#9393a0]">
              No matches found
            </div>
          ) : (
            <div className="w-full divide-y divide-white/10">
              {suggestions.map((item) => (
                <Link
                  key={`${item.mediaType}-${item.id}`}
                  href={`/${item.mediaType}/${item.id}`}
                  prefetch={true}
                  onClick={() => {
                    setDropdownOpen(false);
                    setMobileSearchOpen(false);
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-white/10"
                >
                  <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-black/40">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#f4f7fb]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#8f9bb0]">
                      {item.label}
                      {item.year ? ` ${item.year}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={handleSubmit}
                className="block w-full px-3.5 py-2.5 text-left text-xs font-medium text-[#38bdf8] transition-colors hover:bg-white/10"
              >
                See all results for &quot;{query.trim()}&quot;
              </button>
            </div>
          )}
        </Glass>
      </div>
    );
  }

  return (
    <header
      ref={containerRef}
      className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
        scrolled ? "px-3 pt-2.5 sm:px-6" : "px-0 pt-0"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between gap-2.5 transition-all duration-300 ease-out ${
          scrolled
            ? "h-12 max-w-xl rounded-full border border-white/12 bg-[#0e131c]/75 px-3.5 shadow-[0_10px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-4"
            : "h-16 max-w-7xl rounded-none border border-transparent bg-transparent px-4 sm:px-6"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[#f4f7fb]"
        >
          <img
            src="/potato-mascot.svg"
            alt="PotatoWatch"
            className="h-7 w-7 object-contain"
          />
          <span>PotatoWatch</span>
        </Link>

        <div className="hidden sm:block">
          <TabBar
            items={NAV_TABS}
            value={activeTab}
            link={Link}
            aria-label="Primary navigation"
          />
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSubmit}
            className={`relative hidden transition-all duration-300 sm:block ${
              scrolled ? "w-36 md:w-44" : "w-56 md:w-72"
            }`}
          >
            <SearchField
              value={query}
              onFocus={() => setDropdownOpen(true)}
              onValueChange={(val) => {
                setQuery(val);
                setDropdownOpen(true);
              }}
              placeholder="Search titles"
              aria-label="Search titles"
              className="w-full"
            />
            {renderDropdown()}
          </form>

          <div className="sm:hidden">
            <Button
              variant="glass"
              icon={
                mobileSearchOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )
              }
              aria-label="Toggle search"
              onClick={() => setMobileSearchOpen((v) => !v)}
            />
          </div>

          <Link
            href={activeTab === "library" ? "/" : "/library"}
            prefetch={true}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-[#d4dce8] transition-colors hover:text-white sm:hidden"
          >
            {activeTab === "library" ? "Browse" : "Library"}
          </Link>
        </div>
      </div>

      {mobileSearchOpen && (
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-7xl px-4 pb-3 sm:hidden"
        >
          <SearchField
            value={query}
            onFocus={() => setDropdownOpen(true)}
            onValueChange={(val) => {
              setQuery(val);
              setDropdownOpen(true);
            }}
            placeholder="Search movies, shows, K-Dramas, anime"
            aria-label="Search titles"
            autoFocus
            className="w-full"
          />
          {renderDropdown()}
        </form>
      )}
    </header>
  );
}
