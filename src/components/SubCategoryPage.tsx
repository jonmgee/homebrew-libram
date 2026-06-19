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
        <h1 className="font-cinzel text-2xl font-bold text-ink">Unknown Category</h1>
        <Link to="/" className="font-cinzel mt-4 inline-block text-sm font-semibold text-crimson underline underline-offset-4 hover:text-crimson-light">
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
          className="font-cinzel text-sm font-semibold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          &larr; Home
        </Link>
        <h1 className="font-cinzel text-2xl font-bold text-ink">{cat.label}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subCategories.map((sub: SubCategoryDef) => (
          <Link
            key={sub.slug}
            to={`/browse/${cat.slug}/${sub.slug}`}
            className="parchment-card gilded-border p-5"
          >
            <h2 className="font-cinzel text-lg font-bold text-ink">
              {sub.label}
            </h2>
            <p className="font-fell mt-1 text-sm italic text-ink-light">
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