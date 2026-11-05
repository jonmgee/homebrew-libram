/**
 * For anyone looking at a page someone else shared: it opens an email to the
 * guild with the page's address filled in. Apple asks apps with shared content
 * for a way to report it (guideline 1.2).
 */
export default function ReportLink({ what }: { what: string }) {
  const subject = `Report: ${what}`;
  const body = `What's wrong with this page?\n\n\n\nPage: ${window.location.href}`;
  return (
    <a
      href={`mailto:hello@appwrightsguild.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
      className="phb-description text-xs underline underline-offset-2 print:hidden"
    >
      Report this page
    </a>
  );
}
