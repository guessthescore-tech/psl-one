interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentProps {
  title: string;
  sections: LegalSection[];
}

/**
 * Legal document layout for Terms & Conditions and Privacy Policy.
 */
export function LegalDocument({ title, sections }: LegalDocumentProps) {
  return (
    <article className="flex flex-col gap-6">
      {/* Legal pending banner */}
      <div
        role="note"
        className="flex items-start gap-3 p-4 bg-exp-warning/10 border border-exp-warning/30 rounded-card-sm"
      >
        <span className="text-exp-warning font-bold text-sm flex-shrink-0 mt-0.5" aria-hidden>⚠</span>
        <p className="text-body-sm text-exp-warning/90 leading-relaxed">
          <strong>Placeholder — Legal review pending.</strong>{' '}
          These terms are not legally binding until reviewed and approved by qualified legal counsel.
        </p>
      </div>

      <header>
        <h1 className="text-display-md text-white">{title}</h1>
        <p className="text-body-sm text-exp-muted mt-2">Last updated: June 2026 (draft)</p>
      </header>

      <div className="flex flex-col gap-8">
        {sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-display-sm text-white mb-3">
              {idx + 1}. {section.heading}
            </h2>
            <p className="text-body-md text-white/75 leading-relaxed whitespace-pre-line">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
