import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getCategory } from "../types";
import { getSubCategories, type SubCategoryDef } from "../lib/subcategories";

export default function SubCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = getCategory(category ?? "");

  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!cat) return;
    let cancelled = false;

    async function fetchCounts() {
      // Get all types in this category
      const types = cat!.types;

      // Count entries grouped by type in a single query
      const { data, error } = await supabase
        .from("entries")
        .select("type")
        .in("type", types);

      if (cancelled || error) return;

      const typeCounts: Record<string, number> = {};
      for (const row of data ?? []) {
        typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
      }
      setCounts(typeCounts);
    }

    fetchCounts();
    return () => { cancelled = true; };
  }, [cat]);

  if (!cat) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-zinc-100">Unknown Category</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300">
          &larr; Home
        </Link>
      </div>
    );
  }

  const subCategories = getSubCategories(cat.slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/"
          className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
        >
          &larr; Home
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">{cat.label}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subCategories.map((sub: SubCategoryDef) => (
          <Link
            key={sub.slug}
            to={`/browse/${cat.slug}/${sub.slug}`}
            className="group rounded-xl border border-zinc-700 bg-zinc-900 p-5 transition-colors hover:border-amber-600 hover:bg-zinc-800"
          >
            <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400">
              {sub.label}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {(() => {
                const c = sub.types.reduce((sum, t) => sum + (counts[t] || 0), 0);
                return `${c} entr${c === 1 ? "y" : "ies"}`;
              })()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}