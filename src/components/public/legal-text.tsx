export function LegalText({ content }: { content: string }) {
  const sections = content
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="legal-text">
      {sections.map((section) => {
        const [heading, ...body] = section.split("\n");
        return (
          <section key={section}>
            <h2>{heading}</h2>
            {body.length ? <p>{body.join(" ")}</p> : null}
          </section>
        );
      })}
    </div>
  );
}
