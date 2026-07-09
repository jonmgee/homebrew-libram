import ReactMarkdown from "react-markdown";

/**
 * Shared markdown renderer for entry descriptions, used by all
 * detail renderers so **bold**, *italics* and lists work everywhere.
 * Set `dropCap` to style the first letter like a PHB chapter opening.
 */
export default function MarkdownDescription({
  text,
  dropCap = false,
}: {
  text: string;
  dropCap?: boolean;
}) {
  if (!text) return null;
  return (
    <div className={dropCap ? "phb-dropcap" : undefined}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => <h3 className="phb-h3 mt-3">{children}</h3>,
          h2: ({ children }) => <h3 className="phb-h3 mt-3">{children}</h3>,
          h3: ({ children }) => <h3 className="phb-h3 mt-3">{children}</h3>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
