"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SearchInput } from "@/components/forms/search-input";
import { EmptyState } from "@/components/layout/empty-state";
import type { Business } from "@/types/database";

export function BusinessSearch({ businesses }: { businesses: Business[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return businesses;
    const q = query.toLowerCase();
    return businesses.filter((b) => b.name.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q));
  }, [businesses, query]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Sartaroshxonalarni qidirish..." />
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="Hech narsa topilmadi" description="Boshqa nom bilan qidirib ko'ring." />
        ) : (
          filtered.map((b) => (
            <Link
              key={b.id}
              href={`/business/${b.slug}`}
              className="block rounded-card border border-border bg-surface p-4 transition-colors hover:border-accent-500"
            >
              <p className="font-medium text-slate-900">{b.name}</p>
              {b.address ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {b.address}
                </p>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
