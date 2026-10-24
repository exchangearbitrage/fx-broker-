export function MarkdownBlock({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\n+/).filter(Boolean);

  return (
    <div className="space-y-4 text-brand-secondary">
      {lines.map((line) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={line} className="pt-4 font-heading text-2xl font-semibold text-brand-text">
              {line.replace("## ", "")}
            </h2>
          );
        }
        return (
          <p key={line} className="leading-7">
            {line}
          </p>
        );
      })}
    </div>
  );
}
