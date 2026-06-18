import { Link, useParams } from "react-router-dom";
import { getCategory } from "../types";
import { getSubCategories, type SubCategoryDef } from "../lib/subcategories";

export default function SubCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = getCategory(category ?? "");

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
              {sub.types.length} entr{sub.types.length === 1 ? "y" : "ies"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}