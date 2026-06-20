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
      const types = cat!.types;

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
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h1 className="phb-h1 !text-2xl">Unknown Category</h1>
        <Link to="/" className="phb-small-sc mt-4 inline-block text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light">
          &larr; Home
        </Link>
      </div>
    );
  }

  const subCategories = getSubCategories(cat.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/"
          className="phb-small-sc text-sm font-bold text-crimson underline underline-offset-4 hover:text-crimson-light"
        >
          &larr; Home
        </Link>
        <h1 className="phb-h1 !text-2xl">{cat.label}</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {subCategories.map((sub: SubCategoryDef) => (
          <Link
            key={sub.slug}
            to={`/browse/${cat.slug}/${sub.slug}`}
            className="parchment-card gilded-border block p-6 min-h-[9rem]"
          >
            <div className="float-right ml-3 mb-2 flex h-20 w-20 shrink-0 items-center justify-center border border-parchment-dark bg-parchment-dark/20">
              <span className="phb-description text-center text-[0.55rem] leading-tight">
                Sub-category illustration
              </span>
            </div>
            <h2 className="phb-h2 !text-[1.1rem] !font-bold">
              {sub.label}
            </h2>
            <p className="phb-description mt-1 text-sm">
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