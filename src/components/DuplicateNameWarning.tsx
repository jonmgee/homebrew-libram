export function DuplicateNameWarning({ warning }: { warning: string | null }) {
  if (!warning) return null;
  return (
    <p className="mt-1 text-xs italic text-amber-700">
      ⚠️ {warning}
    </p>
  );
}